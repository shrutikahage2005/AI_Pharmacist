import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pill, LogIn, UserPlus, Shield, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n";

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "consumer">("consumer");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, displayName, selectedRole, whatsapp);
        if (error) throw error;
        toast({ title: t("auth.accountCreated"), description: t("auth.checkEmail") });
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <Pill className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t("auth.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("auth.subtitle")}</p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">{isSignUp ? t("auth.signUp") : t("auth.signIn")}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <Input
                  placeholder={t("auth.displayName")}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  required
                />
                <Input
                  placeholder={t("auth.whatsapp")}
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  required
                  type="tel"
                />
              </>
            )}
            <Input
              type="email"
              placeholder={t("auth.email")}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={t("auth.password")}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />

            {isSignUp && (
              <div>
                <p className="text-sm font-medium mb-2">{t("auth.selectRole")}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { role: "consumer" as const, label: t("auth.consumer"), desc: t("auth.consumerDesc"), icon: ShoppingCart },
                    { role: "admin" as const, label: t("auth.admin"), desc: t("auth.adminDesc"), icon: Shield },
                  ].map(opt => (
                    <button
                      key={opt.role}
                      type="button"
                      onClick={() => setSelectedRole(opt.role)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedRole === opt.role
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <opt.icon className={`w-5 h-5 mb-2 ${selectedRole === opt.role ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="text-sm font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.loading") : isSignUp ? (
                <><UserPlus className="w-4 h-4 mr-2" /> {t("auth.signUp")}</>
              ) : (
                <><LogIn className="w-4 h-4 mr-2" /> {t("auth.signIn")}</>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-4">
            {isSignUp ? t("auth.haveAccount") : t("auth.noAccount")}{" "}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
              {isSignUp ? t("auth.signIn") : t("auth.signUp")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
