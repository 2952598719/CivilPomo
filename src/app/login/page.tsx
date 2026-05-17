"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const sendCode = async () => {
    if (!email.includes("@")) {
      setError("请输入有效邮箱");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "发送失败");
      } else {
        setStep("code");
        setCooldown(60);
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "验证失败");
      } else {
        router.push("/timer");
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center">CivilPomo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "email" ? (
            <>
              <Input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendCode()}
              />
              <Button onClick={sendCode} className="w-full" disabled={loading}>
                {loading ? "发送中..." : "发送验证码"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground text-center">
                验证码已发送至 {email}
              </p>
              <Input
                type="text"
                placeholder="6位验证码"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && verify()}
                autoFocus
              />
              <Button onClick={verify} className="w-full" disabled={loading}>
                {loading ? "验证中..." : "登录"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={sendCode}
                disabled={cooldown > 0 || loading}
              >
                {cooldown > 0 ? `${cooldown}s 后重新发送` : "重新发送验证码"}
              </Button>
              <Button
                variant="ghost"
                className="w-full text-sm text-muted-foreground"
                onClick={() => { setStep("email"); setCode(""); setError(""); }}
              >
                更换邮箱
              </Button>
            </>
          )}
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
