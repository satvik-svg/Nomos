import Sidebar from "@/components/layout/Sidebar";

export default function ExplorePage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Explore
            </h1>
            <p className="text-lg text-gray-600">
              Discover trending content and new creators.
            </p>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-500">
              Content discovery features will be available here once implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}