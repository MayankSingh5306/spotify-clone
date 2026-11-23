import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const superbaseUrl='https://cbeqlmrymmwsjcdmolnq.supabase.co';
const publishKey='sb_publishable_IPfkx-tgmUTstrlVbG4Zcw_4ERVCu9C';

export const supabase = createClient(superbaseUrl, publishKey);