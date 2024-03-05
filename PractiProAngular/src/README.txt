/**
 * Apache mod_rewrite Rules
 *
 * These Apache mod_rewrite rules are defined in the .htaccess file to enable clean URL handling.
 * Requests are redirected to a central 'routes.php' script with the 'request' parameter.
 *
 * Requirements:
 * - Apache web server with mod_rewrite enabled
 *
 * Usage:
 * 1. Include this .htaccess file in your api's root directory.
 * 2. Define the 'routes.php' script to handle URL routing based on the 'request' parameter.
 * 3. Configure additional rules if needed.
 *
 * Example Usage:
 * - Original URL: http://localhost/demoproject/api/employees/managers
 * - Rewritten URL: http://localhost/demoproject/api/routes.php?request=employees/managers
 *
 * Note: Ensure that 'routes.php' contains the necessary logic for handling the 'request' parameter.
 * This talks about the code $_REQUEST['request']
 */

<IfModule mod_rewrite.c>
    RewriteEngine On

    # Exclude existing directories from rewrite
    RewriteCond %{REQUEST_FILENAME} !-d

    # Exclude existing files from rewrite
    RewriteCond %{REQUEST_FILENAME} !-f

    # Rewrite rule for clean URLs
    RewriteRule ^(.*)$ routes.php?request=$1 [L,QSA]
</IfModule>
