import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envFile = fs.readFileSync(path.join(__dirname, '../../.env.local'), 'utf-8')

const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim()
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim()

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: orphans, error: err1 } = await supabase.from('countries_data').select('*').is('map_id', null)
  console.log('Orphan records:', orphans?.length)

  if (orphans?.length > 0) {
    const { data: maps, error: err2 } = await supabase.from('maps').select('*').eq('teacher_email', 'gogh999@gmail.com').order('created_at', { ascending: false })
    if (maps?.length > 0) {
      const firstMapId = maps[0].id
      console.log('Updating orphans to map_id:', firstMapId)
      const { error: err3 } = await supabase.from('countries_data').update({ map_id: firstMapId }).is('map_id', null)
      if (err3) console.error(err3)
      else console.log('Successfully updated orphan records.')
    }
  } else {
    console.log('No update needed.')
  }
}

run()
