import Sidebar from "@/components/layout/Sidebar";

export default function CreatorsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Creators
            </h1>
            <p className="text-lg text-gray-600">
              Discover talented creators on the platform.
            </p>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-500">
              Creator profiles will be displayed here once the system is fully implemented.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}