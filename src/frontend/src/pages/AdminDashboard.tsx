import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Eye,
  EyeOff,
  FileSpreadsheet,
  Lock,
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
import {
  useGetRegistrationCount,
  useGetRegistrations,
} from "../hooks/useQueries";

const ADMIN_USERNAME = "shubhambyk@gmail.com";
const ADMIN_PASSWORD = "Shubham@30";

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
  const link = document.createElement("a");
  link.href = url;
  link.download = `registrations_${today}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ onBack }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [search, setSearch] = useState("");

  const {
    data: registrations,
    isLoading: regLoading,
    refetch,
  } = useGetRegistrations();
  const { data: count } = useGetRegistrationCount();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password. Please try again.");
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

  // Group by game (case-insensitive), sorted alphabetically by game name
  const gameGroups: { gameName: string; rows: Registration[] }[] = [];
  const gameMap = new Map<string, { gameName: string; rows: Registration[] }>();
  for (const r of filtered) {
    const key = r.game.toLowerCase();
    if (!gameMap.has(key)) {
      gameMap.set(key, { gameName: r.game, rows: [] });
    }
    gameMap.get(key)!.rows.push(r);
  }
  for (const entry of gameMap.values()) {
    entry.rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
    gameGroups.push(entry);
  }
  gameGroups.sort((a, b) => a.gameName.localeCompare(b.gameName));

  // Flattened index for deterministic row markers
  let rowCounter = 0;

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
          {isLoggedIn && (
            <Button
              variant="outline"
              className="rounded-full uppercase text-xs font-bold tracking-wider"
              onClick={() => {
                setIsLoggedIn(false);
                setUsername("");
                setPassword("");
              }}
              data-ocid="admin.secondary_button"
            >
              Logout
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 py-10 px-4 max-w-6xl mx-auto w-full">
        {!isLoggedIn ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16"
            data-ocid="admin.panel"
          >
            <div className="w-full max-w-sm bg-card rounded-2xl shadow-lg p-8">
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  Admin Login
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your credentials to continue
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="username"
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    data-ocid="admin.input"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="pr-10"
                      data-ocid="admin.textarea"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-sm text-destructive font-medium">
                    {loginError}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest"
                  data-ocid="admin.primary_button"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </form>
            </div>
          </motion.div>
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
                    {gameGroups.map((group) => (
                      <>
                        {/* Game group header */}
                        <TableRow key={`group-${group.gameName}`}>
                          <TableCell
                            colSpan={9}
                            className="bg-primary/10 text-primary font-bold text-sm uppercase tracking-wider py-2 px-4"
                          >
                            🏅 {group.gameName.toUpperCase()} &mdash;{" "}
                            {group.rows.length} student
                            {group.rows.length !== 1 ? "s" : ""}
                          </TableCell>
                        </TableRow>
                        {/* Rows for this game */}
                        {group.rows.map((reg) => {
                          rowCounter += 1;
                          const idx = rowCounter;
                          return (
                            <TableRow
                              key={reg.id.toString()}
                              className="hover:bg-accent/30 cursor-pointer transition-colors"
                              onClick={() => setSelected(reg)}
                              data-ocid={`admin.row.item.${idx}`}
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
                                <Badge variant="secondary">
                                  {reg.studentClass}
                                </Badge>
                              </TableCell>
                              <TableCell>{reg.gender}</TableCell>
                              <TableCell>{reg.ageGroup}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    reg.food === "Veg" ? "default" : "outline"
                                  }
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
                          );
                        })}
                      </>
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
