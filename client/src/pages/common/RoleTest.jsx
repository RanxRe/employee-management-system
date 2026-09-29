import { useSelector } from "react-redux";

function RoleTest() {
    const { user } = useSelector((state) => state.auth);

    return (
        <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
                <h1 className="text-2xl font-bold sm:text-3xl">
                    Role Protected Page
                </h1>

                <p className="mt-4">
                    Your role is:{" "}
                    <span className="font-semibold">
                        {user?.role}
                    </span>
                </p>
            </div>
        </main>
    );
}

export default RoleTest;