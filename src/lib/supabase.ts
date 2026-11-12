import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url_here'
);

const targetUrl = isSupabaseConfigured ? supabaseUrl! : 'https://placeholder-project.supabase.co';
const targetKey = isSupabaseConfigured ? supabaseAnonKey! : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(targetUrl, targetKey);

export interface StudentProfile {
  id?: string;
  user_id: string;
  school_name: string;
  parent_name: string;
  student_name: string;
  mobile_number: string;
}

const mockDb: StudentProfile[] = [
  {
    user_id: 'EIOS-100101',
    school_name: 'St. Xavier High School',
    parent_name: 'Rajesh Sharma',
    student_name: 'Aarav Sharma',
    mobile_number: '+919876543210'
  }
];

export async function registerStudentByAdmin(data: {
  school_name: string;
  parent_name: string;
  student_name: string;
  mobile_number: string;
}): Promise<StudentProfile> {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const generatedUserId = `EIOS-${randomDigits}`;

  const newRecord: StudentProfile = {
    user_id: generatedUserId,
    school_name: data.school_name,
    parent_name: data.parent_name,
    student_name: data.student_name,
    mobile_number: data.mobile_number,
  };

  if (!isSupabaseConfigured) {
    mockDb.push(newRecord);
    return newRecord;
  }

  const { data: inserted, error } = await supabase
    .from('profiles')
    .insert([newRecord])
    .select()
    .single();

  if (error) throw error;
  return inserted;
}

export async function findProfileByIdentifier(identifier: string): Promise<StudentProfile | null> {
  const cleanInput = identifier.trim();

  if (!isSupabaseConfigured) {
    const found = mockDb.find(
      (item) => item.user_id.toLowerCase() === cleanInput.toLowerCase() || item.mobile_number.includes(cleanInput)
    );
    return found || null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .or(`user_id.eq.${cleanInput},mobile_number.eq.${cleanInput}`)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}