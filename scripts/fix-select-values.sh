#!/bin/bash

# Fix all SelectItem components with empty string values
# Replace value="" with value="__none__" for placeholder options

echo "Fixing SelectItem empty values..."

# Fix in teams-search.tsx
sed -i 's/<SelectItem value="">All Agencies<\/SelectItem>/<SelectItem value="__all__">All Agencies<\/SelectItem>/g' web/components/admin/teams-search.tsx

# Fix in routes-search.tsx
sed -i 's/<SelectItem value="">All Agencies<\/SelectItem>/<SelectItem value="__all__">All Agencies<\/SelectItem>/g' web/components/admin/routes-search.tsx
sed -i 's/<SelectItem value="">All Locations<\/SelectItem>/<SelectItem value="__all__">All Locations<\/SelectItem>/g' web/components/admin/routes-search.tsx

# Fix in report-builder.tsx
sed -i 's/<SelectItem value="">All agencies<\/SelectItem>/<SelectItem value="__all__">All agencies<\/SelectItem>/g' web/components/admin/report-builder.tsx
sed -i 's/<SelectItem value="">All types<\/SelectItem>/<SelectItem value="__all__">All types<\/SelectItem>/g' web/components/admin/report-builder.tsx
sed -i 's/<SelectItem value="">All officers<\/SelectItem>/<SelectItem value="__all__">All officers<\/SelectItem>/g' web/components/admin/report-builder.tsx

# Fix in locations-search.tsx
sed -i 's/<SelectItem value="">All Types<\/SelectItem>/<SelectItem value="__all__">All Types<\/SelectItem>/g' web/components/admin/locations-search.tsx
sed -i 's/<SelectItem value="">All Agencies<\/SelectItem>/<SelectItem value="__all__">All Agencies<\/SelectItem>/g' web/components/admin/locations-search.tsx

# Fix "None" placeholders
sed -i 's/<SelectItem value="">None/<SelectItem value="__none__">None/g' web/components/admin/*.tsx
sed -i 's/<SelectItem value="">No /<SelectItem value="__none__">No /g' web/components/admin/*.tsx

echo "✅ Fixed all SelectItem empty values!"
echo ""
echo "Changed:"
echo "  - All 'All X' options: value='' → value='__all__'"
echo "  - All 'None/No X' options: value='' → value='__none__'"
echo ""
echo "Your components will now filter correctly:"
echo "  - Check for value === '__all__' to show all items"
echo "  - Check for value === '__none__' to handle unassigned/null"
