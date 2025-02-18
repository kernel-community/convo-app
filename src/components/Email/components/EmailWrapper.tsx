import { CoolEmoji, HeartEmoji } from "./EmailEmojis";
import { STAGING, DEFAULT_HOST } from "src/utils/constants";

// Using absolute URL for email clients
// const BASE_URL = process.env.NODE_ENV === "production" ? DEFAULT_HOST : STAGING;
const BASE_URL = STAGING;
const LOGO_URL = `https://${BASE_URL}/images/logo.png`;

export const EmailWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      backgroundColor: "hsl(36, 50%, 96%)",
      padding: "32px 16px",
      minHeight: "100vh",
    }}
  >
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "32px",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#ffffff",
        color: "#000000",
        borderRadius: "8px",
        boxShadow:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      {/* Header */}
      <table
        style={{
          width: "100%",
          marginBottom: "32px",
          borderCollapse: "collapse",
        }}
      >
        <tr>
          <td style={{ width: "40px", padding: 0 }}>
            <img
              src={LOGO_URL}
              alt="Convo Logo"
              width={40}
              height={40}
              style={{
                width: "40px",
                height: "40px",
                opacity: "0.9",
                display: "block",
              }}
            />
          </td>
          <td style={{ padding: 0 }}></td>
          <td style={{ width: "35px", padding: 0, textAlign: "right" }}>
            <HeartEmoji width={35} height={35} />
          </td>
        </tr>
      </table>

      {/* Content */}
      <div style={{ marginBottom: "24px" }}>{children}</div>

      {/* Footer */}
      <div
        style={{
          marginTop: "48px",
          paddingTop: "32px",
          borderTop: "1px solid #e5e7eb",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "0",
          }}
        >
          Hedwig <CoolEmoji width={20} height={20} />, at your service
        </p>
        <p
          style={{
            marginTop: "8px",
            fontSize: "12px",
            margin: "0",
          }}
        >
          This email was sent by Convo. If you didn&apos;t expect this, please
          ignore.
        </p>
      </div>
    </div>
  </div>
);
