import Image from "next/image";
import LoginButton from "./login-button";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="mx-5 border border-stone-200 py-10 sm:mx-auto sm:w-full sm:max-w-md sm:rounded-lg sm:shadow-md dark:border-stone-700">
      <Image
        alt="Platforms Starter Kit"
        width={100}
        height={100}
        className="relative mx-auto h-12 w-auto dark:scale-110 dark:rounded-full dark:border dark:border-stone-400"
        src="/logo.png"
      />
      <h1 className="mt-6 text-center font-cal text-3xl text-black dark:text-white">
        Platforms Starter Kit
      </h1>
      <p className="mt-2 text-center text-sm text-stone-600 dark:text-stone-400">
        Build multi-tenant applications with custom domains. <br />
        <a
          className="font-medium text-black hover:text-stone-800 dark:text-stone-300 dark:hover:text-stone-100"
          href="https://vercel.com/blog/platforms-starter-kit"
          rel="noreferrer"
          target="_blank"
        >
          Read the announcement.
        </a>
      </p>

      <div className="mx-auto mt-4 w-11/12 max-w-xs sm:w-full">
        <Suspense
          fallback={
            <div className="my-2 h-10 w-full rounded-md border border-stone-200 bg-stone-100 dark:border-stone-700 dark:bg-stone-800" />
          }
        >
          <LoginButton />
        </Suspense>
      </div>
    </div>
  );
}

// import { Button, Logo } from "@dub/ui";
// import { HOME_DOMAIN, constructMetadata } from "@dub/utils";
// import { Suspense } from "react";
// import LoginForm from "./form";

// export const metadata = constructMetadata({
//   title: `Sign in to ${process.env.NEXT_PUBLIC_APP_NAME}`,
// });

// export default function LoginPage() {
//   return (
//     <div className="relative z-10 mt-[calc(30vh)] h-fit w-full max-w-md overflow-hidden border-y border-gray-200 sm:rounded-2xl sm:border sm:shadow-xl">
//       <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
//         <a href={HOME_DOMAIN}>
//           <Logo className="h-10 w-10" />
//         </a>
//         <h3 className="text-xl font-semibold">
//           Sign in to {process.env.NEXT_PUBLIC_APP_NAME}
//         </h3>
//         <p className="text-sm text-gray-500">
//           Start creating short links with superpowers
//         </p>
//       </div>
//       <div className="flex flex-col space-y-3 bg-gray-50 px-4 py-8 sm:px-16">
//         <Suspense
//           fallback={
//             <>
//               <Button disabled={true} variant="secondary" />
//               <Button disabled={true} variant="secondary" />
//               <Button disabled={true} variant="secondary" />
//               <div className="mx-auto h-5 w-3/4 rounded-lg bg-gray-100" />
//             </>
//           }
//         >
//           <LoginForm />
//         </Suspense>
//       </div>
//     </div>
//   );
// }
