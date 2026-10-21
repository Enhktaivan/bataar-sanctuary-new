# Camp location — 2026-10-21

Owner reported incorrect coordinates and requested finding the camp in Google Earth and correcting the website. Named Google Maps listing Motherland Of Bataar matches the camp phone 9953 0099, has photos credited Erdii Erdii, and a visitor description identifying Narandat.

Place coordinates (Google Maps !3d/!4d, not the viewport camera): **43.4642132, 100.4523248**. DMS: **43°27′51.17″N 100°27′08.37″E**. Plus code: FF72+MWP, Ömnögovi.

Source: https://www.google.com/maps?cid=5248386212128738233

Google Earth opened at this coordinate; imagery did not render in the connected browser. This correction follows the named Maps listing, not an independently surveyed GPS measurement. Original camp values 43.6820,102.4150 and 43°29'42"N 101°32'18"E disagreed and neither matched the listing.

src/campLocation.ts now supplies camp marker, directions, displayed GPS, and camp weather coordinate label. Other sightseeing/wildlife destinations are unchanged. Independent code review confirmed DMS conversion and scope. Lint, build and targeted built-bundle checks passed. Backend/payment state and unrelated unpublished local edits are unchanged.

Rollback source: 82f0f5e1d739f7ea00495b63749717cd1919c92b; Pages: b96bc48f6a8898ac20faa5e54742bb48e80193ea.
