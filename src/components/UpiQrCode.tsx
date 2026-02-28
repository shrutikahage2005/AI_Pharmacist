import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "@/lib/i18n";

interface UpiQrCodeProps {
  amount: number;
  orderId: string;
  onClose: () => void;
}

const UPI_ID = "shrutikahage86@okaxis";

export default function UpiQrCode({ amount, orderId, onClose }: UpiQrCodeProps) {
  const { t } = useLanguage();
  const amountINR = amount; // already in INR
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=PharmaCare&am=${amountINR.toFixed(2)}&cu=INR&tn=Order_${orderId}`;

  return (
    <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card rounded-2xl p-6 max-w-sm w-full text-center space-y-4 animate-fade-in">
        <h3 className="text-lg font-bold">{t("consumer.paymentQR")}</h3>
        <div className="bg-white p-4 rounded-xl inline-block mx-auto">
          <QRCodeSVG value={upiUrl} size={200} level="H" />
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{t("consumer.scanQR")}</p>
          <p className="text-xl font-bold text-primary">
            {t("consumer.amount")}: ₹{amountINR.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("consumer.orderId")}: #{orderId}
          </p>
          <p className="text-xs text-muted-foreground">UPI: {UPI_ID}</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Done
        </button>
      </div>
    </div>
  );
}
