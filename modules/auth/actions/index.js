"use server"
import { db } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"

/**
 * Next aborts a static render by throwing, and it identifies that error by
 * digest. A blanket catch swallows the signal, which both floods the build log
 * and makes the caller return a fake "no user" result for a render that was
 * only being probed. Rethrow it and let Next do its job.
 */
const rethrowIfFrameworkSignal = (error) => {
    if (error?.digest === "DYNAMIC_SERVER_USAGE") throw error;
};

//fetch user data when user log in first time and store it in db (upsert())
export const onBoardUser = async() =>{
    try {
        const user = await currentUser()

        if (!user) {
            return{ success:false, error:"No Authenticated user found" }
        }

        const {id, firstName, lastName, imageUrl, emailAddresses} = user;

        //upsert--> create new user if dosen't exist or update if alredy exist
        const newUser = await db.user.upsert({
            where:{
                clerkId:id
            },
            update:{
                firstName:firstName || null,
                lastName:lastName || null,
                email:emailAddresses[0]?.emailAddress || "",
                imageUrl:imageUrl || null,
            },//only call when there are changes in the user
            create:{
                clerkId:id,
                firstName:firstName || null,
                lastName:lastName || null,
                email:emailAddresses[0]?.emailAddress || "",
                imageUrl:imageUrl || null,
            }
        })
        return {success:true, user:newUser, message:"User onboarded successfully"};
    } catch (error) {
        rethrowIfFrameworkSignal(error);
        console.log("❌Error in onBoardUser", error);
        return {success:false, error:"Failed to onboard user"};
    }
}

export const currentUserRole = async ()=>{
  try {
    const user = await currentUser();

      if (!user) {
            return { success: false, error: "No authenticated user found" };
        }

        const {id} = user;

        const userRole = await db.user.findUnique({
          where:{
            clerkId:id
          },
          select:{
            role:true
          }
        })
    // Null on the first request after sign-up, before onBoardUser has run.
    return userRole?.role ?? null;
  } catch (error) {
     rethrowIfFrameworkSignal(error);
     console.error("❌ Error fetching user role:", error);
        return { success: false, error: "Failed to fetch user role" };
  }
}

export const getCurrentUser = async()=>{
  const user = await currentUser()

  if (!user) return null;

  const dbUser = await db.user.findUnique({
    where:{
      clerkId:user.id
    },
    select:{
      id:true
    }
  })


  return dbUser;
}