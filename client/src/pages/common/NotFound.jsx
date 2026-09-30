import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <p className="text-6xl font-bold">404</p>

                    <CardTitle className="text-2xl">
                        Page Not Found
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                        The page you are looking for does not exist
                        or may have been moved.
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button
                            variant="outline"
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>

                        <Button
                            onClick={() => navigate("/dashboard")}
                        >
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default NotFound;