import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createDesignation } from "@/services/designation.service";

function CreateDesignation() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const data = {
                name: name.trim(),
            };

            await createDesignation(data);

            setSuccess("Designation created successfully.");

            setTimeout(() => {
                navigate("/designations");
            }, 800);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to create designation."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate("/designations")}
                    aria-label="Back to designations"
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create Designation
                    </h1>

                    <p className="text-sm text-muted-foreground">
                        Add a new employee designation.
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Designation Information</CardTitle>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Designation Name
                            </Label>

                            <Input
                                id="name"
                                type="text"
                                placeholder="e.g. Software Developer"
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                required
                            />
                        </div>

                        {error && (
                            <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
                                {success}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/designations")}
                                disabled={loading}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={loading}>
                                {loading
                                    ? "Creating..."
                                    : "Create Designation"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CreateDesignation;