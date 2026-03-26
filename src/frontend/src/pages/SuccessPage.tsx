import { Button } from "@/components/ui/button";
import { CheckCircle2, Shield, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  registrationId: bigint;
  onRegisterAnother: () => void;
  onAdminClick: () => void;
}

export default function SuccessPage({
  registrationId,
  onRegisterAnother,
  onAdminClick,
}: Props) {
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
              Sports Academy
            </span>
          </div>
          <Button
            onClick={onAdminClick}
            variant="outline"
            className="rounded-full uppercase text-xs font-bold tracking-wider"
            data-ocid="admin.open_modal_button"
          >
            <Shield className="w-4 h-4 mr-1" />
            Admin
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
          className="bg-card rounded-2xl shadow-card p-10 md:p-16 max-w-lg w-full text-center"
          data-ocid="success.card"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </motion.div>

          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Registration Successful!
          </h1>
          <p className="mt-3 text-muted-foreground">
            Your sports registration has been submitted successfully.
          </p>

          <div className="mt-6 bg-accent rounded-xl px-6 py-4">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Registration ID
            </p>
            <p
              className="text-3xl font-bold text-primary"
              data-ocid="success.panel"
            >
              #{registrationId.toString()}
            </p>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Please save your registration ID for future reference.
          </p>

          <Button
            onClick={onRegisterAnother}
            className="mt-8 w-full rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm py-5"
            data-ocid="success.primary_button"
          >
            Register Another Student
          </Button>
        </motion.div>
      </main>

      <footer className="bg-card border-t border-border">
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
