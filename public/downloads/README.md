# Downloads folder

Đặt file installer Windows của FaiRobot Studio vào đây:

```
public/downloads/FaiRobot-Studio-Setup.exe
```

File này sẽ được phục vụ bởi Next.js qua route API bảo vệ `/api/downloads/fairino-studio`.

**Quan trọng:** Không commit file `.exe` vào git. Thêm dòng sau vào `.gitignore`:
```
public/downloads/*.exe
public/downloads/*.dmg
public/downloads/*.AppImage
```
