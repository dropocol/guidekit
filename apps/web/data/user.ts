import prisma from "@/lib/prisma";

// import edge from "@/lib/edge";

export const getUserByEmail = async (email: string) => {
  try {
    // console.log("FINDING USER----------------");
    const user = await prisma.user.findFirst({ where: { email: email } });

    // const userCheck = await prismaEdge.user.findFirst({
    //   where: { email: email },
    // });
    // console.log("USER ------ : ", userCheck);

    return user;
  } catch {
    return null;
  }
};

export const updateUserById = async (id: string, data: any) => {
  try {
    const user = await prisma.user.update({ where: { id }, data });
    return user;
  } catch {
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.log("ERROR : ", JSON.stringify(error, null));
    return null;
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });

    return user;
  } catch {
    return null;
  }
};
