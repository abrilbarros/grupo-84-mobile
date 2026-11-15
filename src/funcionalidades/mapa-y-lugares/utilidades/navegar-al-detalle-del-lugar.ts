import { router } from "expo-router";

export function navegarAlDetalleDelLugar(identificadorDelLugar: string): void {
  router.push({
    pathname: "/lugares/[id]",
    params: { id: identificadorDelLugar },
  });
}
