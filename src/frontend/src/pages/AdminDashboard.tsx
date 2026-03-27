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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Lock,
  Pencil,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Trophy,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Registration } from "../backend.d";
import { useActor } from "../hooks/useActor";
import {
  useGetRegistrationCount,
  useGetRegistrations,
} from "../hooks/useQueries";

const ADMIN_USERNAME = "shubhambyk@gmail.com";
const ADMIN_PASSWORD = "Shubham@30";

const APPAREL_SIZES = [
  "24",
  "26",
  "28",
  "30",
  "32",
  "34",
  "36",
  "38",
  "40",
  "42",
  "44",
  "46",
];

interface Props {
  onBack: () => void;
}

interface EditForm {
  game: string;
  admissionNumber: string;
  studentName: string;
  motherName: string;
  fatherName: string;
  dobDate: string;
  dobMonth: string;
  dobYear: string;
  gender: string;
  ageGroup: string;
  studentClass: string;
  mobileNo: string;
  shoeSize: string;
  tShirtShortsSize: string;
  trackSuitSize: string;
  blazerSize: string;
  food: string;
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

function toEditForm(reg: Registration): EditForm {
  return {
    game: reg.game,
    admissionNumber: reg.admissionNumber,
    studentName: reg.studentName,
    motherName: reg.motherName,
    fatherName: reg.fatherName,
    dobDate: reg.dobDate.toString(),
    dobMonth: reg.dobMonth.toString(),
    dobYear: reg.dobYear.toString(),
    gender: reg.gender,
    ageGroup: reg.ageGroup,
    studentClass: reg.studentClass,
    mobileNo: reg.mobileNo,
    shoeSize: reg.shoeSize,
    tShirtShortsSize: reg.tShirtShortsSize,
    trackSuitSize: reg.trackSuitSize,
    blazerSize: reg.blazerSize,
    food: reg.food,
  };
}

export default function AdminDashboard({ onBack }: Props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [editing, setEditing] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<bigint | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { actor } = useActor();
  const queryClient = useQueryClient();
  const {
    data: registrations,
    isLoading: regLoading,
    refetch,
  } = useGetRegistrations();
  const { data: count, refetch: refetchCount } = useGetRegistrationCount();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid username or password. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetch(), refetchCount()]);
      toast.success("Data refreshed");
    } finally {
      setIsRefreshing(false);
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

  const handleDelete = async (e: React.MouseEvent, reg: Registration) => {
    e.stopPropagation();
    if (
      !confirm(
        `Delete registration for ${reg.studentName} (${reg.admissionNumber})? This cannot be undone.`,
      )
    )
      return;
    if (!actor) {
      toast.error("Not connected to backend. Please try again.");
      return;
    }
    setDeletingId(reg.id);
    try {
      const success = await actor.deleteRegistration(reg.id);
      if (success) {
        toast.success(`Registration for ${reg.studentName} deleted`);
        await queryClient.invalidateQueries({ queryKey: ["registrations"] });
        await queryClient.invalidateQueries({
          queryKey: ["registrationCount"],
        });
      } else {
        toast.error("Registration not found or already deleted");
      }
    } catch (err) {
      toast.error("Failed to delete registration");
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditOpen = (e: React.MouseEvent, reg: Registration) => {
    e.stopPropagation();
    setEditing(reg);
    setEditForm(toEditForm(reg));
  };

  const handleEditSave = async () => {
    if (!actor || !editing || !editForm) return;
    setIsSaving(true);
    try {
      const input = {
        game: editForm.game,
        admissionNumber: editForm.admissionNumber,
        studentName: editForm.studentName,
        motherName: editForm.motherName,
        fatherName: editForm.fatherName,
        dobDate: BigInt(editForm.dobDate || "0"),
        dobMonth: BigInt(editForm.dobMonth || "0"),
        dobYear: BigInt(editForm.dobYear || "0"),
        gender: editForm.gender,
        ageGroup: editForm.ageGroup,
        studentClass: editForm.studentClass,
        mobileNo: editForm.mobileNo,
        shoeSize: editForm.shoeSize,
        tShirtShortsSize: editForm.tShirtShortsSize,
        trackSuitSize: editForm.trackSuitSize,
        blazerSize: editForm.blazerSize,
        food: editForm.food,
      };
      const success = await actor.updateRegistration(editing.id, input);
      if (success) {
        toast.success(`Registration for ${editForm.studentName} updated`);
        await queryClient.invalidateQueries({ queryKey: ["registrations"] });
        setEditing(null);
        setEditForm(null);
      } else {
        toast.error("Failed to update registration");
      }
    } catch (err) {
      toast.error("Error saving changes");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const setField = (key: keyof EditForm, value: string) => {
    setEditForm((prev) => (prev ? { ...prev, [key]: value } : prev));
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

  const gameGroups: { gameName: string; rows: Registration[] }[] = [];
  const gameMap = new Map<string, { gameName: string; rows: Registration[] }>();
  for (const r of filtered) {
    const key = r.game.toLowerCase();
    if (!gameMap.has(key)) gameMap.set(key, { gameName: r.game, rows: [] });
    gameMap.get(key)!.rows.push(r);
  }
  for (const entry of gameMap.values()) {
    entry.rows.sort((a, b) => a.studentName.localeCompare(b.studentName));
    gameGroups.push(entry);
  }
  gameGroups.sort((a, b) => a.gameName.localeCompare(b.gameName));

  let rowCounter = 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="bg-card shadow-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="mr-2 p-2 rounded-full hover:bg-accent transition-colors"
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
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full uppercase text-xs font-bold tracking-wider border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800"
                  onClick={handleExport}
                  disabled={
                    regLoading || !registrations || registrations.length === 0
                  }
                >
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Export to Excel
                </Button>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, admission number, game, class..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>

            <div className="bg-card rounded-2xl shadow-card overflow-hidden">
              {regLoading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No registrations found
                  </p>
                </div>
              ) : (
                <Table>
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
                                >
                                  View
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 text-xs font-bold uppercase ml-1"
                                  onClick={(e) => handleEditOpen(e, reg)}
                                  data-ocid={`admin.edit_button.${idx}`}
                                >
                                  <Pencil className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive/80 text-xs font-bold uppercase ml-1"
                                  onClick={(e) => handleDelete(e, reg)}
                                  disabled={deletingId === reg.id}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  {deletingId === reg.id ? "..." : "Del"}
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

      {/* View Dialog */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-2xl">
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
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null);
            setEditForm(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Edit Registration #{editing?.id?.toString()} —{" "}
              {editing?.studentName}
            </DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Game
                </Label>
                <Input
                  value={editForm.game}
                  onChange={(e) => setField("game", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Admission Number
                </Label>
                <Input
                  value={editForm.admissionNumber}
                  onChange={(e) => setField("admissionNumber", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Student Name
                </Label>
                <Input
                  value={editForm.studentName}
                  onChange={(e) => setField("studentName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Mother's Name
                </Label>
                <Input
                  value={editForm.motherName}
                  onChange={(e) => setField("motherName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Father's Name
                </Label>
                <Input
                  value={editForm.fatherName}
                  onChange={(e) => setField("fatherName", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Date of Birth
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    placeholder="DD"
                    value={editForm.dobDate}
                    onChange={(e) => setField("dobDate", e.target.value)}
                    className="w-16"
                  />
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    placeholder="MM"
                    value={editForm.dobMonth}
                    onChange={(e) => setField("dobMonth", e.target.value)}
                    className="w-16"
                  />
                  <Input
                    type="number"
                    min={2000}
                    max={2020}
                    placeholder="YYYY"
                    value={editForm.dobYear}
                    onChange={(e) => setField("dobYear", e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Gender
                </Label>
                <Select
                  value={editForm.gender}
                  onValueChange={(v) => setField("gender", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="B">B (Boy)</SelectItem>
                    <SelectItem value="G">G (Girl)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Age Group
                </Label>
                <Select
                  value={editForm.ageGroup}
                  onValueChange={(v) => setField("ageGroup", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="U14">U14</SelectItem>
                    <SelectItem value="U17">U17</SelectItem>
                    <SelectItem value="U19">U19</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Class
                </Label>
                <Input
                  value={editForm.studentClass}
                  onChange={(e) => setField("studentClass", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Mobile No
                </Label>
                <Input
                  value={editForm.mobileNo}
                  onChange={(e) => setField("mobileNo", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Shoe Size
                </Label>
                <Input
                  value={editForm.shoeSize}
                  onChange={(e) => setField("shoeSize", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  T-Shirt & Shorts Size
                </Label>
                <Select
                  value={editForm.tShirtShortsSize}
                  onValueChange={(v) => setField("tShirtShortsSize", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPAREL_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Track Suit Size
                </Label>
                <Select
                  value={editForm.trackSuitSize}
                  onValueChange={(v) => setField("trackSuitSize", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPAREL_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Blazer Size
                </Label>
                <Select
                  value={editForm.blazerSize}
                  onValueChange={(v) => setField("blazerSize", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPAREL_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider">
                  Food
                </Label>
                <Select
                  value={editForm.food}
                  onValueChange={(v) => setField("food", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg">Veg</SelectItem>
                    <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => {
                setEditing(null);
                setEditForm(null);
              }}
              disabled={isSaving}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
              onClick={handleEditSave}
              disabled={isSaving}
              data-ocid="admin.save_button"
            >
              {isSaving ? "Saving..." : "Save Changes"}
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
