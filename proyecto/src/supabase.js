// src/supabase.js
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ctiyfbrrjxxoketeeziw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aXlmYnJyanh4b2tldGVleml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NDg5ODMsImV4cCI6MjA3ODAyNDk4M30.erToHVtne7SQJ6UPfIRUZx3tBKZxVE8d7pvjF4idFYQ';
export const supabase = createClient(supabaseUrl, supabaseKey);