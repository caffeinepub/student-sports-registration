import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  Shield,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Registration } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGenerateInviteCode,
  useGetRegistrationCount,
  useGetRegistrations,
  useIsCallerAdmin,
} from "../hooks/useQueries";

interface Props {
  onBack: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

function formatDate(
  dobDate: bigint,
  dobMonth: bigint,
  dobYear: bigint,
): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const m = Number(dobMonth);
  return `${dobDate} ${months[m - 1] ?? ""} ${dobYear}`;
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function exportToCsv(registrations: Registration[]) {
  const headers = [
    "ID",
    "Game",
    "Admission Number",
    "Student Name",
    "Mother's Name",
    "Father's Name",
    "Date of Birth",
    "Gender",
    "Age Group",
    "Class",
    "Mobile No",
    "Shoe Size",
    "T-Shirt & Shorts Size",
    "Track Suit Size",
    "Blazer Size",
    "Food Preference",
    "Submitted Date",
  ];

  const rows = registrations.map((r) => {
    const dob = formatDate(r.dobDate, r.dobMonth, r.dobYear);
    const submittedDate = new Date(
      Number(r.timestamp) / 1_000_000,
    ).toLocaleDateString("en-IN");
    return [
      r.id.toString(),
      r.game,
      r.admissionNumber,
      r.studentName,
      r.motherName,
      r.fatherName,
      dob,
      r.gender,
      r.ageGroup,
      r.studentClass,
      r.mobileNo,
      r.shoeSize,
      r.tShirtShortsSize,
      r.trackSuitSize,
      r.blazerSize,
      r.food,
      submittedDate,
    ].map(escapeCsvField);
  });

  const csvContent = [headers.map(escapeCsvField), ...rows]
    .map((row) => row.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().slice(0, 10);
  const filename = `registrations_${today}.csv`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ onBack }: Props) {
  const { login, loginStatus, identity, clear } = useInternetIdentity();
  const isLoggedIn = loginStatus === "success" && !!identity;
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const {
    data: registrations,
    isLoading: regLoading,
    refetch,
  } = useGetRegistrations();
  const { data: count } = useGetRegistrationCount();
  const { mutateAsync: generateCode, isPending: codeGenerating } =
    useGenerateInviteCode();
  const [selected, setSelected] = useState<Registration | null>(null);
  const [search, setSearch] = useState("");

  const isLoggingIn = loginStatus === "logging-in";

  const handleGenerateCode = async () => {
    try {
      const code = await generateCode();
      await navigator.clipboard.writeText(code);
      toast.success(`Invite code copied: ${code}`);
    } catch {
      toast.error("Failed to generate invite code");
    }
  };

  const handleExport = () => {
    const data = registrations ?? [];
    if (data.length === 0) {
      toast.error("No registrations to export");
      return;
    }
    exportToCsv(data);
    toast.success(`Exported ${data.length} registration(s) to CSV`);
  };

  const filtered = (registrations ?? []).filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.admissionNumber.toLowerCase().includes(q) ||
      r.game.toLowerCase().includes(q) ||
      r.studentClass.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card shadow-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="mr-2 p-2 rounded-full hover:bg-accent transition-colors"
              data-ocid="nav.link"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              Admin Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Button
                variant="outline"
                className="rounded-full uppercase text-xs font-bold tracking-wider"
                onClick={() => clear()}
                data-ocid="admin.secondary_button"
              >
                Logout
              </Button>
            ) : (
              <Button
                className="rounded-full bg-primary text-primary-foreground uppercase text-xs font-bold tracking-wider"
                onClick={() => login()}
                disabled={isLoggingIn}
                data-ocid="admin.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Shield className="w-4 h-4 mr-1" />
                )}
                Login
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 py-10 px-4 max-w-6xl mx-auto w-full">
        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="admin.panel"
          >
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Admin Access Required
            </h2>
            <p className="mt-2 text-muted-foreground max-w-sm">
              Please log in with your administrator account to view registration
              data.
            </p>
            <Button
              className="mt-8 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest px-8"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="admin.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Login with Internet Identity"
              )}
            </Button>
          </motion.div>
        ) : adminLoading ? (
          <div
            className="flex items-center justify-center py-24"
            data-ocid="admin.loading_state"
          >
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !isAdmin ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-center"
            data-ocid="admin.error_state"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="mt-2 text-muted-foreground">
              You don't have admin privileges.
            </p>
            <Button
              variant="outline"
              onClick={() => clear()}
              className="mt-6 rounded-full"
              data-ocid="admin.secondary_button"
            >
              Logout
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="bg-card rounded-xl shadow-card px-6 py-4 flex items-center gap-3">
                  <Users className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Total Registrations
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {count !== undefined ? count.toString() : "—"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-full uppercase text-xs font-bold tracking-wider"
                  onClick={() => refetch()}
                  data-ocid="admin.secondary_button"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full uppercase text-xs font-bold tracking-wider border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={handleExport}
                  disabled={
                    regLoading || !registrations || registrations.length === 0
                  }
                  data-ocid="admin.export_button"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Export to Excel
                </Button>
                <Button
                  className="rounded-full bg-primary text-primary-foreground uppercase text-xs font-bold tracking-wider"
                  onClick={handleGenerateCode}
                  disabled={codeGenerating}
                  data-ocid="admin.primary_button"
                >
                  {codeGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  Generate Invite Code
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission number, game, class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border"
                data-ocid="admin.search_input"
              />
            </div>

            {/* Table */}
            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              {regLoading ? (
                <div className="p-6 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="py-16 text-center"
                  data-ocid="admin.empty_state"
                >
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No registrations found
                  </p>
                </div>
              ) : (
                <Table data-ocid="admin.table">
                  <TableHeader>
                    <TableRow className="bg-accent/50">
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        ID
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Game
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Adm. No
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Student Name
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Class
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Gender
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Age Group
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Food
                      </TableHead>
                      <TableHead className="font-bold uppercase text-xs tracking-wider">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((reg, idx) => (
                      <TableRow
                        key={reg.id.toString()}
                        className="hover:bg-accent/30 cursor-pointer transition-colors"
                        onClick={() => setSelected(reg)}
                        data-ocid={`admin.row.item.${idx + 1}`}
                      >
                        <TableCell className="font-mono font-bold text-primary">
                          #{reg.id.toString()}
                        </TableCell>
                        <TableCell>{reg.game}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {reg.admissionNumber}
                        </TableCell>
                        <TableCell className="font-medium">
                          {reg.studentName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{reg.studentClass}</Badge>
                        </TableCell>
                        <TableCell>{reg.gender}</TableCell>
                        <TableCell>{reg.ageGroup}</TableCell>
                        <TableCell>
                          <Badge
                            variant={reg.food === "Veg" ? "default" : "outline"}
                            className={
                              reg.food === "Veg"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "text-orange-700 border-orange-200"
                            }
                          >
                            {reg.food}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 text-xs font-bold uppercase"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(reg);
                            }}
                            data-ocid="admin.edit_button"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Detail Modal */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-2xl" data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Registration #{selected?.id?.toString()} — {selected?.studentName}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <DetailRow label="Game" value={selected.game} />
              <DetailRow
                label="Admission No"
                value={selected.admissionNumber}
              />
              <DetailRow label="Student Name" value={selected.studentName} />
              <DetailRow label="Mother's Name" value={selected.motherName} />
              <DetailRow label="Father's Name" value={selected.fatherName} />
              <DetailRow
                label="Date of Birth"
                value={formatDate(
                  selected.dobDate,
                  selected.dobMonth,
                  selected.dobYear,
                )}
              />
              <DetailRow label="Gender" value={selected.gender} />
              <DetailRow label="Age Group" value={selected.ageGroup} />
              <DetailRow label="Class" value={selected.studentClass} />
              <DetailRow label="Mobile No" value={selected.mobileNo} />
              <DetailRow label="Shoe Size" value={`UK ${selected.shoeSize}`} />
              <DetailRow
                label="T-Shirt & Shorts"
                value={selected.tShirtShortsSize}
              />
              <DetailRow label="Track Suit" value={selected.trackSuitSize} />
              <DetailRow label="Blazer" value={selected.blazerSize} />
              <DetailRow label="Food" value={selected.food} />
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setSelected(null)}
              data-ocid="admin.close_button"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-card border-t border-border mt-10">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
