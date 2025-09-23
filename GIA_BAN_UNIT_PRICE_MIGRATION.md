# Migration guide: Normalize HoaDonCT.GiaBan as unit price

This runbook helps convert historical data where `HoaDonCT.GiaBan` was saved as a line total (unit price × quantity) to the new convention: store `GiaBan` as unit price (đơn giá) and always compute line totals as `GiaBan × SoLuong`.

## When to run
- After deploying backend changes that write `GiaBan` as unit price for both online and POS flows.
- Ideally during a maintenance window; the script is idempotent if re-run with the same cutoff and backup/restore safeguards.

## What it does
- Backs up the `HoaDonCT` table to `HoaDonCT_backup_before_giaban_migration`.
- Uses a cutoff datetime to target legacy orders before the new code deployment.
- Heuristically detects rows where `GiaBan` looks like a line total and divides by `SoLuong` to get unit price.
- Provides verification queries to compare recomputed subtotals to stored `HoaDon.TongTien` (informational only; shipping/discounts apply).

## Steps
1) Adjust the cutoff timestamp in `sql/migrate_giaban_to_unit_price.sql`:
   - `SET @CUTOFF := 'YYYY-MM-DD HH:MM:SS';`
   - Use the exact deployment timestamp of the new backend.

2) Backup DB (recommended):
   - Full MySQL backup of database `5SHUTTLE`.

3) Run migration in MySQL:
   - Execute the file `sql/migrate_giaban_to_unit_price.sql` against the `5SHUTTLE` database.

4) Validate:
   - Review the result sets from the verification queries near the end of the script.
   - Spot-check a few orders created before the cutoff and ensure line totals are correct using `GiaBan × SoLuong`.

5) Rollback (if needed):
   - The script includes commented rollback commands to restore from `HoaDonCT_backup_before_giaban_migration`.

## Post-migration checklist
- [ ] Re-check return/refund calculations on a legacy order (with voucher) to ensure correct refund amounts.
- [ ] Verify analytics/`ThongKe` endpoints still show correct values.
- [ ] Smoke test POS and online order creation to ensure new rows are already unit price.

## Notes
- This script uses a tolerance (±0.01) to detect line totals because of rounding.
- If there were historical promotions changing unit price at purchase time, that unit price is intended to be what `GiaBan` stores going forward. The migration can’t reconstruct historical promo prices perfectly if they weren’t persisted; it focuses on converting obvious line totals to unit prices.
- If you maintained custom historical logic for `TongTien` (e.g., shipping included, voucher discounts), the verification query compares only subtotal (sum of line totals) and not final payable amount.
