export type Signature = {
  id: string;
  full_name: string;
  organization: string;
  position: string | null;
  email: string | null;
  agreed: boolean;
  signed_at: string;
};

export type Declaration = {
  id: number;
  title: string;
  body: string;
  event_name: string | null;
  event_date: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      signatures: {
        Row: Signature;
        Insert: {
          id?: string;
          full_name: string;
          organization: string;
          position?: string | null;
          email?: string | null;
          agreed?: boolean;
          signed_at?: string;
        };
        Update: Partial<Signature>;
        Relationships: [];
      };
      declaration: {
        Row: Declaration;
        Insert: {
          id?: number;
          title: string;
          body: string;
          event_name?: string | null;
          event_date?: string | null;
          updated_at?: string;
        };
        Update: Partial<Declaration>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
