// ============ payments/PaymentSandbox.ts ============
import type { PaymentProvider } from "./Payment.service";

export const SANDBOX_PROVIDER_NAME = "SANDBOX";

export class SandboxPaymentProvider implements PaymentProvider {
  readonly name = SANDBOX_PROVIDER_NAME;

  async initiateCharge(params: { amount: number; reference: string }) {
    return { providerTransactionRef: `SANDBOX-${params.reference}-${Date.now()}` };
  }

  async refund(): Promise<void> {
    // rien à rembourser : aucun argent n'a bougé
  }
}

// Mode « achat sans débit » pour tester le parcours complet (achat → personnalisation →
// site en ligne), y compris sur le serveur de production.
//
//   PAYMENT_MODE=sandbox            active le mode (absent ou autre valeur = paiements réels)
//   SANDBOX_CLIENT_IDS=id1,id2      (optionnel) limite le mode à ces comptes ; les autres paient normalement
//   ALLOW_SANDBOX_IN_PROD=true      obligatoire si NODE_ENV=production
//   SANDBOX_ALL_CLIENTS=true        obligatoire en production SANS liste d'ids : confirme que
//                                   TOUS les comptes achètent gratuitement (phase de test, avant lancement)
//
// En production sans liste d'ids, n'importe quel visiteur obtient un site actif gratuitement :
// c'est donc un choix explicite (SANDBOX_ALL_CLIENTS), jamais un oubli de configuration.
export class SandboxPolicy {
  // null = tous les clients (autorisé hors production uniquement)
  private constructor(
    private enabled: boolean,
    private allowedClientIds: Set<string> | null
  ) {}

  static fromEnv(env: NodeJS.ProcessEnv = process.env): SandboxPolicy {
    if (env.PAYMENT_MODE !== "sandbox") return new SandboxPolicy(false, new Set());

    const isProd = env.NODE_ENV === "production";
    if (isProd && env.ALLOW_SANDBOX_IN_PROD !== "true") {
      throw new Error("PAYMENT_MODE=sandbox en production exige ALLOW_SANDBOX_IN_PROD=true");
    }

    const ids = (env.SANDBOX_CLIENT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

    if (isProd && ids.length === 0 && env.SANDBOX_ALL_CLIENTS !== "true") {
      throw new Error(
        "PAYMENT_MODE=sandbox en production sans SANDBOX_CLIENT_IDS exige SANDBOX_ALL_CLIENTS=true (tous les comptes seront gratuits)"
      );
    }

    // Avant : une liste vide donnait un Set vide, donc le mode ne s'appliquait à PERSONNE
    // malgré le message « TOUS les clients ». Désormais : liste vide = tous les clients.
    const scope = ids.length > 0 ? new Set(ids) : null;

    console.warn(
      `[payments] MODE SANDBOX ACTIF - ${scope ? `${scope.size} compte(s) concerné(s)` : "TOUS les clients"} : aucun débit réel`
    );
    return new SandboxPolicy(true, scope);
  }

  appliesTo(clientId: string): boolean {
    if (!this.enabled) return false;
    return this.allowedClientIds === null || this.allowedClientIds.has(clientId);
  }
}