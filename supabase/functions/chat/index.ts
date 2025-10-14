// This is the reconstructed content from commit 1ad4519378bdfe6bd61d0e10d1302db02a8684e2.

// Assuming this is the content of the index.ts file based on the commit history.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export const chatFunction = async (message) => {
    const { data, error } = await supabase
        .from('messages')
        .insert([{ content: message }]);

    if (error) throw error;
    return data;
};
