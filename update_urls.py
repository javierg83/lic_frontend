import os
import re

src_dir = r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src"
env_path = r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\environments\environment.ts"

# files where we found localhost:8000
files_to_update = [
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\licitaciones\sub-features\items\services\items.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\licitaciones\sub-features\gestion\services\gestion.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\licitaciones\sub-features\entregas\services\entregas.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\licitaciones\sub-features\gestion\components\gestion-licitacion-card\gestion-licitacion-card.component.html",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\licitaciones\services\licitacion.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\licitaciones\sub-features\\datos-economicos\services\datos-economicos.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\licitaciones\components\items-homologados\items-homologados.component.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\\features\dashboard\services\dashboard.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\demo\services\show.services.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\demo\services\new.services.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\features\demo\services\list.services.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\\features\config\services\config.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\core\services\auth.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\core\services\upload.service.ts",
    r"c:\Desarrollo\IA\Proyectos\licitaciones\lic_frontend\src\app\core\auth_user\pages\login\login.ts"
]

for file_path in files_to_update:
    if not os.path.exists(file_path):
        continue
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "http://localhost:8000" not in content:
        continue
        
    if file_path.endswith(".ts"):
        # calculate relative path exactly
        rel_path = os.path.relpath(os.path.dirname(env_path), os.path.dirname(file_path)).replace("\\", "/")
        import_stmt = f"import {{ environment }} from '{rel_path}/environment';\n"
        
        # Add import
        if "environment" not in import_stmt or "export { environment }" not in content:
            if "import { environment }" not in content:
                content = import_stmt + content
        
        # Replace
        # e.g. 'http://localhost:8000/licitaciones' -> `${environment.apiUrl}/licitaciones` inside a backtick or regular string
        # e.g. `http://localhost:8000/...` -> `${environment.apiUrl}/...`
        # Simple string replacement logic:
        # If it is 'http://localhost:8000/something', change to `${environment.apiUrl}/something` and change outer quotes to backticks
        def replacer(match):
            outer_quote = match.group(1)
            rest_of_url = match.group(2)
            # return with backticks
            return f"`${{environment.apiUrl}}{rest_of_url}`"
            
        # regex to match 'http://localhost:8000...' or "http://localhost:8000..." or `http://localhost:8000...`
        content = re.sub(r"(['\"`])http://localhost:8000(.*?)\1", replacer, content)
        
        # what if it's partly in a backtick like `http://localhost:8000/licitaciones/${this.licitacionId}`
        # The regex above will capture the backtick and end of backtick, wait, no, (.*?) won't safely handle inner backticks.
        # Actually doing a pure string replace is safer.
        content = content.replace("'http://localhost:8000", "`${environment.apiUrl}")
        content = content.replace("\"http://localhost:8000", "`${environment.apiUrl}")
        # if it started with backtick, replace just the base string
        content = content.replace("`http://localhost:8000", "`${environment.apiUrl}")
        
        # Ensure ending quotes are converted to backticks if we did `.replace` above (which might leave trailing ' or ")
        # A simpler way:
        content = re.sub(r"'\$\{(environment\.apiUrl)\}(.*?)'", r"`${\1}\2`", content)
        content = re.sub(r"\"\$\{(environment\.apiUrl)\}(.*?)\"", r"`${\1}\2`", content)

    elif file_path.endswith(".html"):
        # 'http://localhost:8000/licitaciones/gestion/documentos/' + doc.id + '/download'
        content = content.replace("http://localhost:8000", "https://placeholder-backend-url.herokuapp.com")
        
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Done updating URLs")
