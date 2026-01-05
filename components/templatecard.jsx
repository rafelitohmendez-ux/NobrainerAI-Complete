// Define TemplateCard component outside of the Home component
const TemplateCard = ({ title, description, path, icon: Icon }) => {
    return (
      <Link href={path}>
        <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300 cursor-pointer">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-500">{description}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm text-blue-500 font-medium">
              Use this template →
            </div>
          </div>
        </div>
      </Link>
    );
  }