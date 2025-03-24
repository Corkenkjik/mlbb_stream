1. chạy server deno run -A --env-file=.env server/index.ts
2. mở postman
3. chạy game>reset

## sau khi test ping

4. referee > create (nhập đúng referee-id)
5. chạy referee > get-matches (lấy id của trận test ping)
4. chạy setup-team > get-test-ping (nhập id của trận test ping)
5. (Optional) Thay đổi vị trí tuyển thủ hoặc switch team

## Game start ban pick
6. Thực hiện lại bước 5 (match id)
7. Chạy game > create-game (nhập id của match), nằm trong body
8. chạy stream > start-game
