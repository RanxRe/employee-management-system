import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { getMyAdminProfile } from "@/services/admin.service";
import { setUser } from "@/store/slices/authSlice";

function Dashboard() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await getMyAdminProfile();

                dispatch(setUser(profile));
            } catch (error) {
                console.error("Profile error:", error);
            }
        };

        fetchProfile();
    }, [dispatch]);

    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <h1 className="text-2xl font-bold sm:text-3xl">
                    Dashboard
                </h1>

                <p className="mt-2 text-muted-foreground">
                    Welcome back! <span className="text-black font-bold sm:text-2xl">{user?.name}</span>
                </p>

                <div className="mt-6 rounded-lg border p-4">
                    <p>
                        <span className="font-medium">User ID:</span>{" "}
                        {user?._id}
                    </p>

                    <p className="mt-2">
                        <span className="font-medium">Name:</span>{" "}
                        {user?.name}
                    </p>

                    <p className="mt-2 break-words">
                        <span className="font-medium">Email:</span>{" "}
                        {user?.email}
                    </p>

                    <p className="mt-2">
                        <span className="font-medium">Role:</span>{" "}
                        {user?.role}
                    </p>

                    <p className="mt-2">
                        <span className="font-medium">Status:</span>{" "}
                        {user?.status}
                    </p>
                </div>
            </div>
        </main>
    );
}

export default Dashboard;