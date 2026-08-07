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
      destinations: {
        Row: {
          country: string
          created_at: string
          description: string | null
          featured: boolean
          id: string
          image_key: string
          name: string
          region: string
          slug: string
        }
        Insert: {
          country: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          name: string
          region?: string
          slug: string
        }
        Update: {
          country?: string
          created_at?: string
          description?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          name?: string
          region?: string
          slug?: string
        }
        Relationships: []
      }
      flights: {
        Row: {
          airline: string
          arrive_at: string
          cabin: string
          created_at: string
          depart_at: string
          flight_no: string
          from_city: string
          id: string
          price: number
          stops: number
          to_city: string
        }
        Insert: {
          airline: string
          arrive_at: string
          cabin?: string
          created_at?: string
          depart_at: string
          flight_no: string
          from_city: string
          id?: string
          price: number
          stops?: number
          to_city: string
        }
        Update: {
          airline?: string
          arrive_at?: string
          cabin?: string
          created_at?: string
          depart_at?: string
          flight_no?: string
          from_city?: string
          id?: string
          price?: number
          stops?: number
          to_city?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          amenities: string[]
          city: string
          country: string
          created_at: string
          id: string
          image_key: string
          name: string
          price_per_night: number
          rating: number
          stars: number
        }
        Insert: {
          amenities?: string[]
          city: string
          country: string
          created_at?: string
          id?: string
          image_key?: string
          name: string
          price_per_night: number
          rating?: number
          stars?: number
        }
        Update: {
          amenities?: string[]
          city?: string
          country?: string
          created_at?: string
          id?: string
          image_key?: string
          name?: string
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
      tour_packages: {
        Row: {
          category: string
          created_at: string
          days: number
          description: string | null
          destination_id: string | null
          featured: boolean
          id: string
          image_key: string
          max_people: number
          min_people: number
          nights: number
          place: string
          price: number
          rating: number
          slug: string
          title: string
        }
        Insert: {
          category?: string
          created_at?: string
          days?: number
          description?: string | null
          destination_id?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          max_people?: number
          min_people?: number
          nights?: number
          place: string
          price: number
          rating?: number
          slug: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          days?: number
          description?: string | null
          destination_id?: string | null
          featured?: boolean
          id?: string
          image_key?: string
          max_people?: number
          min_people?: number
          nights?: number
          place?: string
          price?: number
          rating?: number
          slug?: string
          title?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
      booking_item_type: ["flight", "hotel", "tour"],
      booking_status: ["pending", "confirmed", "cancelled"],
    },
  },
} as const
