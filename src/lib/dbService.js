import { supabase } from './supabase'
import { auth as fbAuth, db as fbDb, hasFirebaseConfig } from './firebase'

// Switch provider based on VITE_BACKEND_PROVIDER ('firebase' or 'supabase')
// If not specified, default to firebase if firebase is configured, else supabase.
const providerEnv = import.meta.env.VITE_BACKEND_PROVIDER
export const isFirebaseActive = () => {
  if (providerEnv === 'firebase') return true
  if (providerEnv === 'supabase') return false
  return hasFirebaseConfig
}

console.log(`[dbService] Active provider: ${isFirebaseActive() ? 'Firebase' : 'Supabase'}`)

// Helper to convert Firestore user info to match Supabase structure
const mapFirebaseUser = (fbUser) => {
  if (!fbUser) return null
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    user_metadata: {
      full_name: fbUser.displayName || '익명 학생',
      avatar_url: fbUser.photoURL || ''
    }
  }
}

// Helper to convert Firestore doc to match Supabase format (converting timestamps)
const mapDoc = (doc) => {
  const data = doc.data()
  let createdAt = data.created_at
  if (createdAt && typeof createdAt.toDate === 'function') {
    createdAt = createdAt.toDate().toISOString()
  }
  return {
    id: doc.id,
    ...data,
    created_at: createdAt
  }
}

export const dbService = {
  auth: {
    // Check session
    getSession: () => new Promise((resolve) => {
      if (isFirebaseActive()) {
        const unsubscribe = fbAuth.onAuthStateChanged((fbUser) => {
          unsubscribe()
          resolve({ data: { session: fbUser ? { user: mapFirebaseUser(fbUser) } : null } })
        })
      } else {
        supabase.auth.getSession().then(resolve)
      }
    }),

    // Listen for Auth changes
    onAuthStateChange: (callback) => {
      if (isFirebaseActive()) {
        const unsubscribe = fbAuth.onAuthStateChanged((fbUser) => {
          const mappedSession = fbUser ? { user: mapFirebaseUser(fbUser) } : null
          callback('SIGNED_IN', mappedSession)
        })
        return {
          data: {
            subscription: {
              unsubscribe: () => unsubscribe()
            }
          }
        }
      } else {
        return supabase.auth.onAuthStateChange(callback)
      }
    },

    // Sign in with Google
    signInWithGoogle: async (returnTo = '/') => {
      if (isFirebaseActive()) {
        const { signInWithPopup, GoogleAuthProvider } = await import('firebase/auth')
        const provider = new GoogleAuthProvider()
        try {
          const result = await signInWithPopup(fbAuth, provider)
          return { data: { user: mapFirebaseUser(result.user) }, error: null }
        } catch (error) {
          return { data: null, error }
        }
      } else {
        return supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}${returnTo}`
          }
        })
      }
    },

    // Sign out
    signOut: async () => {
      if (isFirebaseActive()) {
        const { signOut } = await import('firebase/auth')
        try {
          await signOut(fbAuth)
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase.auth.signOut()
      }
    }
  },

  // Map Operations
  maps: {
    // Get all maps created by teacher
    getMaps: async (teacherEmail) => {
      if (isFirebaseActive()) {
        try {
          const { getDocs, query, collection, where } = await import('firebase/firestore')
          const q = query(collection(fbDb, 'maps'), where('teacher_email', '==', teacherEmail))
          const snapshot = await getDocs(q)
          const maps = snapshot.docs.map(mapDoc)
          // In-memory sorting by created_at desc to avoid needing index config
          maps.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
            return timeB - timeA
          })
          return { data: maps, error: null }
        } catch (error) {
          return { data: null, error }
        }
      } else {
        return supabase
          .from('maps')
          .select('*')
          .eq('teacher_email', teacherEmail)
          .order('created_at', { ascending: false })
      }
    },

    // Get specific map details
    getMap: async (mapId) => {
      if (isFirebaseActive()) {
        try {
          const { doc, getDoc } = await import('firebase/firestore')
          const docRef = doc(fbDb, 'maps', mapId)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            return { data: mapDoc(docSnap), error: null }
          } else {
            return { data: null, error: { message: 'Document not found' } }
          }
        } catch (error) {
          return { data: null, error }
        }
      } else {
        return supabase
          .from('maps')
          .select('name, teacher_email, reveal_threshold, is_active, study_mode, include_oceans, include_polar, allowed_continents')
          .eq('id', mapId)
          .single()
      }
    },

    // Create a new map
    createMap: async (name, teacherEmail) => {
      if (isFirebaseActive()) {
        try {
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
          const docRef = await addDoc(collection(fbDb, 'maps'), {
            name,
            teacher_email: teacherEmail,
            reveal_threshold: 5,
            is_active: true,
            study_mode: 'countries',
            include_oceans: true,
            include_polar: true,
            allowed_continents: 'Asia,Europe,Africa,North America,South America,Oceania,Antarctica',
            created_at: serverTimestamp()
          })
          return { data: { id: docRef.id }, error: null }
        } catch (error) {
          return { data: null, error }
        }
      } else {
        return supabase.from('maps').insert([{
          name,
          teacher_email: teacherEmail
        }])
      }
    },

    // Delete a map and its related student data
    deleteMap: async (mapId) => {
      if (isFirebaseActive()) {
        try {
          const { doc, deleteDoc, getDocs, query, collection, where } = await import('firebase/firestore')
          // 1. Delete all country registrations first
          const q = query(collection(fbDb, 'countries_data'), where('map_id', '==', mapId))
          const snapshot = await getDocs(q)
          const batchPromises = snapshot.docs.map(d => deleteDoc(doc(fbDb, 'countries_data', d.id)))
          await Promise.all(batchPromises)

          // 2. Delete the map document
          await deleteDoc(doc(fbDb, 'maps', mapId))
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        // Delete country records then delete map
        const { error: dataError } = await supabase.from('countries_data').delete().eq('map_id', mapId)
        if (dataError) return { error: dataError }
        return supabase.from('maps').delete().eq('id', mapId)
      }
    },

    // Reset all registrations for a map
    resetMapCountriesData: async (mapId) => {
      if (isFirebaseActive()) {
        try {
          const { doc, deleteDoc, getDocs, query, collection, where } = await import('firebase/firestore')
          const q = query(collection(fbDb, 'countries_data'), where('map_id', '==', mapId))
          const snapshot = await getDocs(q)
          const batchPromises = snapshot.docs.map(d => deleteDoc(doc(fbDb, 'countries_data', d.id)))
          await Promise.all(batchPromises)
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase.from('countries_data').delete().eq('map_id', mapId)
      }
    },

    // Update map settings
    updateMap: async (mapId, updates) => {
      if (isFirebaseActive()) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          await updateDoc(doc(fbDb, 'maps', mapId), updates)
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase.from('maps').update(updates).eq('id', mapId)
      }
    }
  },

  // Country Data Operations
  countriesData: {
    // Get country data for a specific country link on a map
    getCountriesData: async (mapId, countryId) => {
      if (isFirebaseActive()) {
        try {
          const { getDocs, query, collection, where } = await import('firebase/firestore')
          const q = query(
            collection(fbDb, 'countries_data'),
            where('map_id', '==', mapId),
            where('link', '==', countryId)
          )
          const snapshot = await getDocs(q)
          const data = snapshot.docs.map(mapDoc)
          data.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
            return timeB - timeA
          })
          return { data, error: null }
        } catch (error) {
          return { data: null, error }
        }
      } else {
        return supabase
          .from('countries_data')
          .select('*')
          .eq('link', countryId)
          .eq('map_id', mapId)
          .order('created_at', { ascending: false })
      }
    },

    // Get all registrations in map, or all registrations by a specific user for Dashboard
    getAllCountriesData: async (mapId, authorName = null) => {
      if (isFirebaseActive()) {
        try {
          const { getDocs, query, collection, where } = await import('firebase/firestore')
          let q
          if (mapId) {
            q = query(collection(fbDb, 'countries_data'), where('map_id', '==', mapId))
          } else if (authorName) {
            q = query(collection(fbDb, 'countries_data'), where('author_name', '==', authorName))
          } else {
            q = query(collection(fbDb, 'countries_data'))
          }
          const snapshot = await getDocs(q)
          const data = snapshot.docs.map(mapDoc)
          data.sort((a, b) => {
            const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
            const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
            return timeB - timeA
          })
          return { data, error: null }
        } catch (error) {
          return { data: null, error }
        }
      } else {
        let query = supabase
          .from('countries_data')
          .select('*')
          .order('created_at', { ascending: false })
        if (mapId) {
          query = query.eq('map_id', mapId)
        } else if (authorName) {
          query = query.eq('author_name', authorName)
        }
        return query
      }
    },

    // Insert country data
    addCountryData: async (record) => {
      if (isFirebaseActive()) {
        try {
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
          await addDoc(collection(fbDb, 'countries_data'), {
            country_name: record.country_name,
            content: record.content,
            link: record.link,
            map_id: record.map_id,
            author_name: record.author_name,
            author_avatar: record.author_avatar || '',
            created_at: serverTimestamp()
          })
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase.from('countries_data').insert([record])
      }
    },

    // Update country registration content (notes)
    updateCountryContent: async (id, content) => {
      if (isFirebaseActive()) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          await updateDoc(doc(fbDb, 'countries_data', id), { content })
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase.from('countries_data').update({ content }).eq('id', id)
      }
    },

    // Update country registration fields (e.g. name and/or content)
    updateCountryData: async (id, updates) => {
      if (isFirebaseActive()) {
        try {
          const { doc, updateDoc } = await import('firebase/firestore')
          await updateDoc(doc(fbDb, 'countries_data', id), updates)
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase.from('countries_data').update(updates).eq('id', id)
      }
    },

    // Update country name by query matching user registration (specific logic in CountryPanel)
    updateCountryNameByQuery: async (mapId, countryId, authorName, newCountryName) => {
      if (isFirebaseActive()) {
        try {
          const { getDocs, query, collection, where, doc, updateDoc } = await import('firebase/firestore')
          const q = query(
            collection(fbDb, 'countries_data'),
            where('link', '==', countryId),
            where('map_id', '==', mapId),
            where('author_name', '==', authorName)
          )
          const snapshot = await getDocs(q)
          const promises = snapshot.docs
            .filter(d => d.data().content?.includes('등록했습니다! 🎉'))
            .map(d => updateDoc(doc(fbDb, 'countries_data', d.id), { country_name: newCountryName }))
          await Promise.all(promises)
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase
          .from('countries_data')
          .update({ country_name: newCountryName })
          .eq('link', countryId)
          .eq('map_id', mapId)
          .eq('author_name', authorName)
          .like('content', '%등록했습니다! 🎉%')
      }
    },

    // Delete specific registration record
    deleteCountryData: async (id) => {
      if (isFirebaseActive()) {
        try {
          const { doc, deleteDoc } = await import('firebase/firestore')
          await deleteDoc(doc(fbDb, 'countries_data', id))
          return { error: null }
        } catch (error) {
          return { error }
        }
      } else {
        return supabase.from('countries_data').delete().eq('id', id)
      }
    },

    // Subscribe to map registration updates (real-time)
    subscribeCountriesData: (mapId, callback) => {
      if (isFirebaseActive()) {
        let unsubscribe = () => {}
        // Listen asynchronously
        import('firebase/firestore').then(({ onSnapshot, query, collection, where }) => {
          const q = query(collection(fbDb, 'countries_data'), where('map_id', '==', mapId))
          unsubscribe = onSnapshot(q, () => {
            callback()
          })
        })
        return {
          unsubscribe: () => unsubscribe()
        }
      } else {
        const channel = supabase.channel(`countries_data_changes_${mapId}`)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'countries_data', filter: `map_id=eq.${mapId}` }, () => {
            callback()
          })
          .subscribe()
        return {
          unsubscribe: () => supabase.removeChannel(channel)
        }
      }
    }
  }
}
