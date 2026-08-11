export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          created_by: string | null
          customer_name: string
          duration_min: number
          email: string | null
          id: string
          kind: string
          notes: string | null
          phone: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_name?: string
          duration_min?: number
          email?: string | null
          id?: string
          kind?: string
          notes?: string | null
          phone?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_name?: string
          duration_min?: number
          email?: string | null
          id?: string
          kind?: string
          notes?: string | null
          phone?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          created_at: string
          guests: number
          id: string
          item_id: string | null
          item_type: Database["public"]["Enums"]["booking_item_type"]
          notes: string | null
          status: Database["public"]["Enums"]["booking_status"]
          subtitle: string | null
          title: string
          total_price: number
          travel_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guests?: number
          id?: string
          item_id?: string | null
          item_type: Database["public"]["Enums"]["booking_item_type"]
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          subtitle?: string | null
          title: string
          total_price?: number
          travel_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          guests?: number
          id?: string
          item_id?: string | null
          item_type?: Database["public"]["Enums"]["booking_item_type"]
          notes?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          subtitle?: string | null
          title?: string
          total_price?: number
          travel_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          created_at: string
          depth: number
          id: string
          locale: string
          node_id: string | null
          node_label: string
          session_id: string
        }
        Insert: {
          created_at?: string
          depth?: number
          id?: string
          locale?: string
          node_id?: string | null
          node_label: string
          session_id: string
        }
        Update: {
          created_at?: string
          depth?: number
          id?: string
          locale?: string
          node_id?: string | null
          node_label?: string
          session_id?: string
        }
        Relationships: []
      }
      destinations: {
        Row: {
          country: string
          country_ar: string
          created_at: string
          description: string | null
          description_ar: string | null
          featured: boolean
          id: string
          image_key: string
          name: string
          name_ar: string
          region: string
          slug: string
        }
        Insert: {
          country: string
          country_ar?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          name: string
          name_ar?: string
          region?: string
          slug: string
        }
        Update: {
          country?: string
          country_ar?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          name?: string
          name_ar?: string
          region?: string
          slug?: string
        }
        Relationships: []
      }
      flights: {
        Row: {
          airline: string
          airline_ar: string
          arrive_at: string
          cabin: string
          created_at: string
          depart_at: string
          flight_no: string
          from_city: string
          from_city_ar: string
          id: string
          price: number
          stops: number
          to_city: string
          to_city_ar: string
        }
        Insert: {
          airline: string
          airline_ar?: string
          arrive_at: string
          cabin?: string
          created_at?: string
          depart_at: string
          flight_no: string
          from_city: string
          from_city_ar?: string
          id?: string
          price: number
          stops?: number
          to_city: string
          to_city_ar?: string
        }
        Update: {
          airline?: string
          airline_ar?: string
          arrive_at?: string
          cabin?: string
          created_at?: string
          depart_at?: string
          flight_no?: string
          from_city?: string
          from_city_ar?: string
          id?: string
          price?: number
          stops?: number
          to_city?: string
          to_city_ar?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          amenities: string[]
          city: string
          city_ar: string
          country: string
          created_at: string
          id: string
          image_key: string
          name: string
          name_ar: string
          price_per_night: number
          rating: number
          stars: number
        }
        Insert: {
          amenities?: string[]
          city: string
          city_ar?: string
          country: string
          created_at?: string
          id?: string
          image_key?: string
          name: string
          name_ar?: string
          price_per_night: number
          rating?: number
          stars?: number
        }
        Update: {
          amenities?: string[]
          city?: string
          city_ar?: string
          country?: string
          created_at?: string
          id?: string
          image_key?: string
          name?: string
          name_ar?: string
          price_per_night?: number
          rating?: number
          stars?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      question_nodes: {
        Row: {
          answer: string | null
          answer_ar: string | null
          created_at: string
          id: string
          is_active: boolean
          label: string
          label_ar: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          answer?: string | null
          answer_ar?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          label_ar?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          answer?: string | null
          answer_ar?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          label_ar?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_nodes_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "question_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      site_content: {
        Row: {
          created_at: string
          data_ar: Json
          data_en: Json
          id: string
          section: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_ar?: Json
          data_en?: Json
          id?: string
          section: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_ar?: Json
          data_en?: Json
          id?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name_ar: string
          name_en: string
          quote_ar: string
          quote_en: string
          rating: number
          role_ar: string
          role_en: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en: string
          quote_ar?: string
          quote_en: string
          rating?: number
          role_ar?: string
          role_en?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string
          quote_ar?: string
          quote_en?: string
          rating?: number
          role_ar?: string
          role_en?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tour_packages: {
        Row: {
          category: string
          created_at: string
          days: number
          description: string | null
          description_ar: string | null
          destination_id: string | null
          featured: boolean
          id: string
          image_key: string
          max_people: number
          min_people: number
          nights: number
          place: string
          place_ar: string
          price: number
          rating: number
          slug: string
          title: string
          title_ar: string
        }
        Insert: {
          category?: string
          created_at?: string
          days?: number
          description?: string | null
          description_ar?: string | null
          destination_id?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          max_people?: number
          min_people?: number
          nights?: number
          place: string
          place_ar?: string
          price: number
          rating?: number
          slug: string
          title: string
          title_ar?: string
        }
        Update: {
          category?: string
          created_at?: string
          days?: number
          description?: string | null
          description_ar?: string | null
          destination_id?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          max_people?: number
          min_people?: number
          nights?: number
          place?: string
          place_ar?: string
          price?: number
          rating?: number
          slug?: string
          title?: string
          title_ar?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_packages_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      appointment_status: "scheduled" | "done" | "cancelled"
      booking_item_type: "flight" | "hotel" | "tour"
      booking_status: "pending" | "confirmed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      appointment_status: ["scheduled", "done", "cancelled"],
      booking_item_type: ["flight", "hotel", "tour"],
      booking_status: ["pending", "confirmed", "cancelled"],
    },
  },
} as const
