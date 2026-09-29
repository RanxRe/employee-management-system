import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { getAllDesignations } from "@/services/designation.service";

function Designations() {
    const navigate = useNavigate();

    const [designations, setDesignations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDesignations = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getAllDesignations();

                setDesignations(data.designations || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load designations."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDesignations();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Designations
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Manage employee designations.
                    </p>
                </div>

                <Button
                    onClick={() =>
                        navigate("/designations/create")
                    }
                >
                    <Plus className="size-4" />
                    Create Designation
                </Button>
            </div>

            {/* List */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        Designation List
                        <span className="ml-2 text-sm font-normal text-muted-foreground">
                            ({designations.length})
                        </span>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {loading && (
                        <div className="py-10 text-center text-sm text-muted-foreground">
                            Loading designations...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                            {error}
                        </div>
                    )}

                    {!loading &&
                        !error &&
                        designations.length === 0 && (
                            <div className="py-10 text-center text-sm text-muted-foreground">
                                No designations found.
                            </div>
                        )}

                    {!loading &&
                        !error &&
                        designations.length > 0 && (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[600px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="px-4 py-3 font-medium">
                                                #
                                            </th>

                                            <th className="px-4 py-3 font-medium">
                                                Name
                                            </th>

                                            <th className="px-4 py-3 font-medium">
                                                Status
                                            </th>

                                            <th className="px-4 py-3 text-right font-medium">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {designations.map((designation, index) => (
                                            <tr
                                                key={designation._id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="px-4 py-3 font-medium">
                                                    {index + 1}
                                                </td>

                                                <td className="px-4 py-3 font-medium">
                                                    {designation.name}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <span
                                                        className={
                                                            designation.status === "active"
                                                                ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                                                                : "rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                                                        }
                                                    >
                                                        {designation.status}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-3 text-right">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            navigate(
                                                                `/designations/${designation._id}/edit`
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                </CardContent>
            </Card>
        </div>
    );
}

export default Designations;