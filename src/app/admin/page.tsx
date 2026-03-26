import { createClient } from "@/lib/supabase/server";
import NavBar from "@/components/NavBar";
import AdminUserCard from "@/components/AdminUserCard";

export default async function AdminPage() {
  const supabase = createClient();

  // Get all profiles
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, created_at")
    .order("display_name");

  // Get all coffees grouped by user
  const { data: coffees } = await supabase
    .from("coffees")
    .select("user_id, scanned_at");

  // Compute stats per user
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const userStats =
    profiles?.map((profile) => {
      const userCoffees =
        coffees?.filter((c) => c.user_id === profile.id) || [];
      const monthCoffees = userCoffees.filter(
        (c) => new Date(c.scanned_at) >= monthStart
      );

      return {
        id: profile.id,
        displayName: profile.display_name,
        totalCount: userCoffees.length,
        monthCount: monthCoffees.length,
      };
    }) || [];

  // Sort by total descending
  userStats.sort((a, b) => b.totalCount - a.totalCount);

  const totalAllUsers = userStats.reduce((s, u) => s + u.totalCount, 0);

  return (
    <div className="min-h-screen bg-amber-50 pb-20">
      <div className="bg-gradient-to-b from-amber-700 to-amber-600 text-white px-4 pt-8 pb-6 rounded-b-3xl">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold">Administration</h1>
          <p className="text-amber-200 text-sm mt-1">
            {userStats.length} utilisateurs &middot; {totalAllUsers} cafes au
            total
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4 space-y-3">
        {userStats.map((user) => (
          <AdminUserCard key={user.id} user={user} />
        ))}

        {userStats.length === 0 && (
          <div className="text-center text-amber-400 mt-8">
            <p>Aucun utilisateur</p>
          </div>
        )}
      </div>

      <NavBar isAdmin={true} />
    </div>
  );
}
