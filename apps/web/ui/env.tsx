import React from "react";

const EnvironmentBanner: React.FC = () => {
  const json = JSON.parse(JSON.stringify(process.env));
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="w-full bg-yellow-500 py-1 text-center text-sm font-medium text-black">
        Development Environment : {process.env.ENV_USER}
        {/* <pre>{JSON.stringify(json, null, 2)}</pre> */}
      </div>
    );
  }
  return null;
};

export default EnvironmentBanner;
