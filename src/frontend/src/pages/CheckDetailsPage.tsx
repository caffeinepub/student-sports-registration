import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  Search,
  Shield,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Registration } from "../backend.d";
import { useGetRegistrationByAdmissionNumber } from "../hooks/useQueries";

interface Props {
  onBack: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-3 border-b border-border last:border-0">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground sm:w-48 shrink-0">
        {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}

function RegistrationDetails({ reg }: { reg: Registration }) {
  const dobFormatted = `${reg.dobDate.toString()} ${MONTHS[Number(reg.dobMonth) - 1] ?? ""} ${reg.dobYear.toString()}`;
  const genderLabel =
    reg.gender === "B"
      ? "Boy (B)"
      : reg.gender === "G"
        ? "Girl (G)"
        : reg.gender;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-ocid="check.card"
    >
      <Card className="rounded-2xl shadow-card border-border mt-6">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-foreground">
                {reg.studentName}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Admission No:{" "}
                <span className="font-bold text-primary">
                  {reg.admissionNumber}
                </span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Personal Details
            </p>
            <DetailRow label="Game / Sport" value={reg.game} />
            <DetailRow label="Admission Number" value={reg.admissionNumber} />
            <DetailRow label="Student Name" value={reg.studentName} />
            <DetailRow label="Mother's Name" value={reg.motherName} />
            <DetailRow label="Father's Name" value={reg.fatherName} />
            <DetailRow label="Date of Birth" value={dobFormatted} />
            <DetailRow label="Gender" value={genderLabel} />
            <DetailRow label="Age Group" value={reg.ageGroup} />
            <DetailRow label="Class" value={reg.studentClass} />
            <DetailRow label="Mobile No" value={reg.mobileNo} />
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">
              Kit & Food
            </p>
            <DetailRow label="Shoe Size" value={`UK ${reg.shoeSize}`} />
            <DetailRow
              label="T-Shirt & Shorts Size"
              value={reg.tShirtShortsSize}
            />
            <DetailRow label="Track Suit Size" value={reg.trackSuitSize} />
            <DetailRow label="Blazer Size" value={reg.blazerSize} />
            <DetailRow label="Food Preference" value={reg.food} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CheckDetailsPage({ onBack }: Props) {
  const [admissionNumber, setAdmissionNumber] = useState("");
  const [searched, setSearched] = useState(false);
  const { mutateAsync, isPending, data, reset } =
    useGetRegistrationByAdmissionNumber();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admissionNumber.trim()) return;
    setSearched(false);
    await mutateAsync(admissionNumber.trim());
    setSearched(true);
  };

  const handleChange = (v: string) => {
    setAdmissionNumber(v);
    if (searched) {
      setSearched(false);
      reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card shadow-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              PM SHRI KENDRIYA VIDYALAYA ARTY CENTRE NASHIK
            </span>
          </div>
          <Button
            onClick={onBack}
            variant="outline"
            className="rounded-full uppercase text-xs font-bold tracking-wider"
            data-ocid="check.secondary_button"
          >
            <Shield className="w-4 h-4 mr-1" />
            Back to Home
          </Button>
        </div>
      </header>

      <main className="flex-1 py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Check Your Registration
            </h1>
            <p className="mt-2 text-muted-foreground text-sm max-w-sm mx-auto">
              Enter your admission number to view your registration details.
            </p>
          </div>

          <Card className="rounded-2xl shadow-card border-border">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="check-admission">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Admission Number
                    </span>
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="check-admission"
                      placeholder="Enter your admission number"
                      value={admissionNumber}
                      onChange={(e) => handleChange(e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      data-ocid="check.input"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isPending || !admissionNumber.trim()}
                  className="w-full rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm py-5"
                  data-ocid="check.primary_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </form>

              {isPending && (
                <div
                  className="mt-6 flex items-center justify-center gap-3 text-muted-foreground"
                  data-ocid="check.loading_state"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Looking up registration...</span>
                </div>
              )}

              {searched && data === null && !isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-xl bg-destructive/10 border border-destructive/20 px-5 py-4 text-center"
                  data-ocid="check.error_state"
                >
                  <p className="text-sm font-semibold text-destructive">
                    No registration found for this admission number.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Please check your admission number and try again.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {searched && data && !isPending && <RegistrationDetails reg={data} />}

          <div className="mt-8 text-center">
            <Button
              onClick={onBack}
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              data-ocid="check.secondary_button"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Registration
            </Button>
          </div>
        </motion.div>
      </main>

      <footer className="bg-card border-t border-border mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">
              PM SHRI KENDRIYA VIDYALAYA ARTY CENTRE NASHIK
            </span>
          </div>
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
