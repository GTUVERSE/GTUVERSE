import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { FeaturedCarousel } from "@/components/featured-carousel"
import { StreamsGrid } from "@/components/streams-grid"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex flex-1">
          <Sidebar />

          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-8">
              {/* Featured Stream */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Featured Research</h2>
                <FeaturedCarousel />
              </section>

              {/* Recommended Streams */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Your Projects</h2>
                <StreamsGrid />
              </section>

              {/* Recently Viewed */}
              <section>
                <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">Your recent activity will appear here</p>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
