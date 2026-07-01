export type Course = {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  progress: number;
  created_at: string;
};

export type StudyRecord = {
  id: string;
  user_id: string | null;
  course_id: string | null;
  duration_min: number;
  studied_at: string;
  created_at: string;
};

export type Goal = {
  id: string;
  user_id: string | null;
  title: string;
  deadline: string | null;
  reminder_time: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      courses: {
        Row: Course;
        Insert: Partial<Course> & { title: string };
        Update: Partial<Course>;
        Relationships: [];
      };
      study_records: {
        Row: StudyRecord;
        Insert: Partial<StudyRecord> & { duration_min: number };
        Update: Partial<StudyRecord>;
        Relationships: [];
      };
      goals: {
        Row: Goal;
        Insert: Partial<Goal> & { title: string };
        Update: Partial<Goal>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
