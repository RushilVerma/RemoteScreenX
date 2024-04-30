## Start your Application
### For Android

```bash
# using npm
npm run android
```

### For iOS

```bash
# using npm
npm run ios
```

## Set IP of Server in Client
### Localhost (for testing on the same machine):
```
const ws = new WebSocket('ws://127.0.0.1:8080');
```

### Specific IP address (for networked servers):
```
const ws = new WebSocket('ws://192.168.1.100:8080');
```

### Public IP address or domain (for internet-accessible servers):
```
const ws = new WebSocket('ws://your-public-ip-address:8080'); // Replace your-public-ip-address with the server's public IP address or domain, and 8080 with the server's port
```