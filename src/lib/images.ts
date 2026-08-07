import dest1 from "@/assets/dest-1.jpg";
import dest2 from "@/assets/dest-2.jpg";
import dest3 from "@/assets/dest-3.jpg";
import dest4 from "@/assets/dest-4.jpg";

const map: Record<string, string> = { dest1, dest2, dest3, dest4 };

export function imageFor(key: string | null | undefined) {
  return (key && map[key]) || dest1;
}
