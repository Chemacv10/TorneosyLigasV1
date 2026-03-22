-- Añadir columnas cuota individual por jugador en parejas
ALTER TABLE lp_parejas
  ADD COLUMN IF NOT EXISTS cuota1 text DEFAULT 'pendiente',
  ADD COLUMN IF NOT EXISTS cuota2 text DEFAULT 'pendiente';
