"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { SignInResponse } from "next-auth/react";
// export async function authenticate(formData: any) {
//     console.log("formData", formData);
//     let data: any = null;
//     try {
//       const session = await signIn("credentials", formData);
//       console.log("session", session);
//       data = { success: true, message: "login successful" };
//       return JSON.parse(JSON.stringify(data));
//     } catch (err: any) {
//       console.log(err);
//       if (err.type === "AuthError") {
//         data = { error: { message: err.message } };
//         return JSON.parse(JSON.stringify(data));
//       }
//       data = { error: { message: "Failed to login", error: err } };
//       return JSON.parse(JSON.stringify(data));
//     }
//   }
function stringifyJSON(data: any): string {
  return JSON.stringify(data);
}

export async function authenticate(
  formData: Record<string, unknown>,
): Promise<string | undefined> {
  try {
    await signIn("credentials", formData);
    return stringifyJSON({ success: true, message: "Login Successful" });
    // console.log("session", session);
    // if (session) {

    // }
    // console.log(session);
    // return stringifyJSON({ success: false, message: "Credentials not found" });
  } catch (err: any) {
    if (err instanceof AuthError) {
      const message = err.message;
      return stringifyJSON({ error: { message: message } });
    }

    return stringifyJSON({ error: { message: "Failed to login" } });
  }
}
