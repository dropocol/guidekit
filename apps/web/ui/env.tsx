import React from "react";
// echo 'Environment Variables:' && env | sort && echo 'Building...'

const EnvironmentBanner: React.FC = () => {
  const json = JSON.parse(JSON.stringify(process.env));
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.APP_ENV !== "production"
  ) {
    return (
      <div className="w-full bg-yellow-500 py-1 text-center text-sm font-medium text-black">
        Development Environment : {process.env.APP_ENV}
        {/* <pre>{JSON.stringify(json, null, 2)}</pre> */}
      </div>
    );
  }
  return null;
};

export default EnvironmentBanner;
