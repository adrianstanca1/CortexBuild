# 🧪 Developer Console - Testing Instructions

## 🎯 **Obiectiv**

Să verificăm că utilizatorii cu rol `developer` se conectează corect la **Developer Console** (noua pagină de development), nu la vechiul Developer Dashboard.

---

## ✅ **Verificare Rapidă**

### Pas 1: Verifică utilizatorul în baza de date

```bash
node server/check-database.js
```

**Verifică că există**:
```
{
  id: 'user-5',
  email: 'dev@constructco.com',
  name: 'Developer User',
  role: 'developer',
  company_id: 'company-1'
}
```

✅ **Rolul trebuie să fie exact**: `developer`

---

### Pas 2: Pornește serverele

```bash
npm run dev:all
```

**Verifică că ambele servere pornesc**:
- Frontend: http://localhost:3000/
- Backend: http://localhost:3001/

---

### Pas 3: Testează login-ul

1. **Deschide browser** la: http://localhost:3000/

2. **Logout** dacă ești deja logat (click pe avatar → Logout)

3. **Login** cu:
   ```
   Email: dev@constructco.com
   Password: parola123
   ```

4. **Deschide Developer Tools** (F12) și verifică **Console**

---

## 🔍 **Ce să cauți în Console**

După login, ar trebui să vezi în consolă:

```
✅ Login successful: Developer User
🔄 Setting current user...
🚀 Navigating to dashboard...
📍 Current navigation stack before: []
📍 Navigation stack set to developer-console
✅ User set - dashboard will render automatically
✅ Current user exists - showing app: Developer User
📊 Navigation stack length: 1
🏠 No navigation - showing dashboard directly
🎯 DEVELOPER ROLE DETECTED - Rendering Developer Console
👤 Current user: {id: 'user-5', name: 'Developer User', email: 'dev@constructco.com', role: 'developer', ...}
🖥️ Developer Console component mounted!
```

**Mesajele cheie**:
- ✅ `📍 Navigation stack set to developer-console`
- ✅ `🎯 DEVELOPER ROLE DETECTED - Rendering Developer Console`
- ✅ `🖥️ Developer Console component mounted!`

---

## 🎨 **Ce ar trebui să vezi pe ecran**

### ✅ **Corect - Developer Console**

Dacă totul funcționează, vei vedea:

1. **Header purple** cu text "Developer Console"
2. **Subtitle**: "Interactive Development Environment"
3. **Badge**: "Developer Mode"
4. **3 Tabs**:
   - Console & Sandbox
   - API Tester
   - Dev Tools
5. **Layout cu 2 panele**:
   - Stânga: Code Editor (dark theme)
   - Dreapta: Console Output

### ❌ **Incorect - Vechiul Dashboard**

Dacă vezi:
- Widget-uri (DeveloperFocusWidget, DeveloperMetricsWidget)
- Grafice și statistici
- Layout de dashboard tradițional

→ **Înseamnă că încă se încarcă vechiul dashboard!**

---

## 🐛 **Troubleshooting**

### Problema 1: Încă văd vechiul dashboard

**Soluție**:
1. **Hard refresh** în browser:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Clear browser cache**:
   - F12 → Application → Clear storage → Clear site data
   - Sau: Settings → Privacy → Clear browsing data

3. **Logout și login din nou**

4. **Restart serverele**:
   ```bash
   # Oprește serverele (Ctrl+C)
   npm run dev:all
   ```

---

### Problema 2: Nu văd mesajele în consolă

**Soluție**:
1. Asigură-te că Developer Tools sunt deschise (F12)
2. Verifică tab-ul "Console"
3. Asigură-te că nu sunt filtrate mesajele (click pe "Default levels")

---

### Problema 3: Eroare la login

**Soluție**:
1. Verifică că backend-ul rulează (http://localhost:3001/)
2. Verifică parola: `parola123` (nu `password123`)
3. Rulează din nou:
   ```bash
   node server/setup-dashboard-users.js
   ```

---

### Problema 4: "Invalid token" în consolă

**Soluție**:
1. Logout complet
2. Clear browser cache
3. Login din nou

---

## 📊 **Verificare Completă**

### Checklist pentru Developer Console:

- [ ] Login cu dev@constructco.com / parola123 funcționează
- [ ] Văd header purple cu "Developer Console"
- [ ] Văd 3 tabs (Console & Sandbox, API Tester, Dev Tools)
- [ ] Văd Code Editor în stânga
- [ ] Văd Console Output în dreapta
- [ ] Pot scrie cod în editor
- [ ] Pot rula cod (buton "Run Code")
- [ ] Văd output în Console Output
- [ ] Mesajele din consolă confirmă: "🎯 DEVELOPER ROLE DETECTED"
- [ ] Mesajele din consolă confirmă: "🖥️ Developer Console component mounted!"

---

## 🧪 **Test Funcțional**

După ce vezi Developer Console, testează funcționalitatea:

### Test 1: Code Execution

1. Scrie în Code Editor:
   ```javascript
   console.log("Hello from Developer Console!");
   const numbers = [1, 2, 3, 4, 5];
   const sum = numbers.reduce((a, b) => a + b, 0);
   console.log("Sum:", sum);
   ```

2. Click "Run Code"

3. Verifică Console Output:
   - Ar trebui să vezi: "Hello from Developer Console!"
   - Ar trebui să vezi: "Sum: 15"

### Test 2: API Tester

1. Click pe tab "API Tester"
2. Setează:
   - Method: GET
   - URL: `https://jsonplaceholder.typicode.com/users/1`
3. Click "Send Request"
4. Verifică că vezi JSON response

### Test 3: Save/Load Code

1. Scrie cod în editor
2. Click pe icon "Save"
3. Refresh pagina (F5)
4. Login din nou
5. Click pe icon "Load"
6. Verifică că codul salvat se încarcă

---

## 📝 **Raportare Probleme**

Dacă întâmpini probleme, raportează:

1. **Ce ai văzut**: Screenshot sau descriere
2. **Ce ai așteptat**: Ce ar fi trebuit să vezi
3. **Mesaje din consolă**: Copy-paste din Developer Tools Console
4. **Pași de reproducere**: Cum să reproducem problema

---

## ✅ **Success Criteria**

Developer Console funcționează corect dacă:

1. ✅ Login cu `dev@constructco.com` / `parola123` funcționează
2. ✅ Văd Developer Console (nu vechiul dashboard)
3. ✅ Pot executa cod JavaScript
4. ✅ Pot testa API endpoints
5. ✅ Pot salva/încărca cod
6. ✅ Mesajele din consolă confirmă încărcarea corectă

---

**🎉 Dacă toate criteriile sunt îndeplinite, Developer Console funcționează perfect!**

---

**Last Updated**: 2025-01-10  
**Version**: 1.0.0

