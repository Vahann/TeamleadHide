const getIssueObject = (issue) => {
  return {
    key: issue.key,
    id: issue.id,
    summary: issue.fields.summary,
    description:
      typeof issue.fields.description === "object" &&
      issue.fields.description !== null
        ? issue.fields.description.content[0].content[0].text
        : issue.fields.description,
    assignee:
      issue.fields.assignee !== null
        ? issue.fields.assignee.displayName
        : "Unassigned",
    avatar:
      issue.fields.assignee !== null
        ? issue.fields.assignee.avatarUrls["16x16"]
        : null,
  };
};

export default function routes(app, addon, models) {
  // Redirect root path to /atlassian-connect.json,
  // which will be served by atlassian-connect-express.
  const baseUrl = "/rest/api/3";
  const baseUrl2 = "/rest/api/2";
  const tokenCheck = () => addon.checkValidToken();
  app.get("/", (req, res) => {
    res.redirect("/atlassian-connect.json");
  });

  /**
   * @swagger
   * components:
   *   schemas:
   *     TableName:
   *       type: object
   *       required:
   *         - text
   *         - user_id
   *         - instance_id
   *       properties:
   *         id:
   *           type: integer
   *           description: Автоматически генерируемый id
   *         text:
   *           type: string
   *           description: Название таблицы
   *         user_id:
   *           type: string
   *           description: Jira userAccountId
   *         instance_id:
   *           type: string
   *           description: Jira clientId
   *       example:
   *         id: 1
   *         text: Table name
   *         user_id: 623da540865b810069e50bc2
   *         instance_id: 3f91567a-9a2e-390b-a27e-321030997456
   */

  /**
   * @swagger
   * /issue:
   *   get:
   *     summary: Возвращает список задач текущего пользователя
   *     responses:
   *       200:
   *         description: Массив задач.
   *         content:
   *           'application/json':
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   id:
   *                     type: string
   *                     description: ID задачи в jira-инстансе
   *                     example: 10636
   *                   key:
   *                     type: string
   *                     description: Key задачи в проекте jira
   *                     example: PROJ-123
   *                   description:
   *                     type: string
   *                     description: Превая строка описания задачи
   *                     example: Задача собственно состоит в том чтобы
   *                   summary:
   *                     type: string
   *                     description: Summary задачи
   *                     example: Разработать REST API для приложения
   *                   assignee:
   *                     type: string
   *                     description: Имя assignee
   *                     example: Маргарита Кравцова
   *                   avatar:
   *                     type: string
   *                     description:
   *                       Аватар assignee размера 16х16px. Если фото не установлено, размер картинки может сильно отличаться
   *                     example:
   *                         https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/623da540866b810069e50bc2/0f859b66-824a-4e39-8005-bfd145cf880b/16
   */
  app.get("/issues", tokenCheck(), (req, res) => {
    const httpClient = addon.httpClient(req);
    httpClient.get(
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        url: `${baseUrl}/search?jql=assignee in (${req.context.userAccountId})`,
      },
      function (err, response, body) {
        if (err) {
          console.log(response.statusCode + ": " + err);
          res.send("Error: " + response.statusCode + ": " + err);
        } else {
          const bodyData = JSON.parse(body);
          const data = bodyData.issues.map((issue) => {
            return getIssueObject(issue);
          });
          const dataBody = JSON.stringify(data);
          res.send(dataBody);
        }
      }
    );
  });

  /**
   * @swagger
   * /issue/{issueId}:
   *   delete:
   *     summary: Удаляет задачу и её подзадачи
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID задачи в jira-инстансе
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Удаление прошло успешно
   *       404:
   *         description: Параметр id некорректный или отсутствует
   *       403:
   *         description: Нет доступа
   */
  app.delete("/issue/:issueId", tokenCheck(), (req, res) => {
    const queryString = req.originalUrl;
    const httpClient = addon.httpClient(req);
    httpClient.del(
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        url: `${baseUrl}${queryString}?deleteSubtasks=true`,
      },
      function (err, response, body) {
        if (err) {
          console.log(response.statusCode + ": " + err);
          res.send("Error: " + response.statusCode + ": " + err);
        } else {
          if (response.statusCode !== 204) {
            res.status(response.statusCode).send();
          } else {
            res.status(204).send();
          }
        }
      }
    );
  });

  /**
   * @swagger
   * /issue/{issueId}:
   *   put:
   *     summary: Обновляет значения summary или description задачи
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID задачи в jira-инстансе
   *         schema:
   *           type: integer
   *     requestBody:
   *       content:
   *         'application/json':
   *           schema:
   *             type: object
   *             properties:
   *               summary:
   *                 type: string
   *                 description: Описание задачи
   *                 example: Есть идея получше
   *               description:
   *                 type: string
   *                 description: Описание задачи
   *                 example: Концепция изменилась. Всё нужно переделать!
   *     responses:
   *       204:
   *         description: Внесение изменений прошло успешно
   *         content:
   *           'application/json':
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: string
   *                   description: ID задачи в jira-инстансе
   *                   example: 10636
   *                 key:
   *                   type: string
   *                   description: Key задачи в проекте jira
   *                   example: PROJ-123
   *                 description:
   *                   type: string
   *                   description: Превая строка описания задачи
   *                   example: Концепция изменилась. Всё нужно переделать!
   *                 summary:
   *                   type: string
   *                   description: Есть идея получше
   *                   example: Разработать REST API для приложения
   *                 assignee:
   *                   type: string
   *                   description: Имя assignee
   *                   example: Маргарита Кравцова
   *                 avatar:
   *                   type: string
   *                   description: Аватар assignee размера 16х16px. Если фото не установлено, размер картинки может сильно отличаться
   *                   example: https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/623da540866b810069e50bc2/0f859b66-824a-4e39-8005-bfd145cf880b/16
   *       400:
   *         description: Некорректный формат тела запроса
   *       404:
   *         description: Параметр id некорректный или отсутствует
   *       403:
   *         description: Нет доступа
   */
  app.put("/issue/:issueId", tokenCheck(), (req, res) => {
    const queryString = req.originalUrl;
    const { issueId } = req.params;
    const httpClient = addon.httpClient(req);
    const bodyData = JSON.stringify({ fields: req.body });
    httpClient.put(
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        url: `${baseUrl2}${queryString}`,
        body: bodyData,
      },
      function (err, response) {
        if (err) {
          console.log(response.statusCode + ": " + err);
          res.send("Error: " + response.statusCode + ": " + err);
        } else {
          if (response.statusCode === 204) {
            httpClient.get(
              {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                url: `${baseUrl2}/issue/${issueId}`,
              },
              function (err, response, body) {
                if (err) {
                  console.log(response.statusCode + ": " + err);
                  res.send("Error: " + response.statusCode + ": " + err);
                } else {
                  const issue = JSON.parse(body);
                  const data = getIssueObject(issue);
                  const dataBody = JSON.stringify(data);
                  res.send(dataBody);
                }
              }
            );
          } else {
            res.status(response.statusCode).send();
          }
        }
      }
    );
  });

  /**
   * @swagger
   * /tables:
   *   get:
   *     summary: Получает данные таблицы текущего пользователя
   *     responses:
   *       200:
   *         description: Данные о названии таблицы текущего пользователя получены успешно
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 text:
   *                   type: string
   *                   description: Имя таблицы задач текущего пользователя
   *                   example: Имя таблицы
   *       404:
   *         description: В базе нет данных об имени таблицы текущего пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Not found
   */
  app.get("/tables", tokenCheck(), async (req, res) => {
    models.tablename
      .findOne({
        where: { user_id: req.context.userAccountId },
      })
      .then((result) => {
        if (result !== null) {
          res.send({ text: result.text });
        } else {
          res.status(404).send({ message: "Not found" });
        }
      })
      .catch((err) => console.log("Error: ", err));
  });

  /**
   * @swagger
   * /tables:
   *   put:
   *     summary: Изменяет имя таблицы задач текущего пользователя
   *     requestBody:
   *       content:
   *         'application/json':
   *           schema:
   *             type: object
   *             properties:
   *               text:
   *                 type: string
   *                 description: Имя таблицы
   *                 example: Новое имя таблицы
   *     responses:
   *       200:
   *         description: Внесение изменений прошло успешно
   */
  app.put("/tables", tokenCheck(), (req, res) => {
    models.tablename
      .findOne({
        where: { user_id: req.context.userAccountId },
      })
      .then((tableName) => {
        if (tableName !== null) {
          tableName
            .update(req.body)
            .then((result) => {
              if (result !== null) {
                res.send({ text: result.text });
              }
            })
            .catch((err) => console.log(err));
        } else {
          models.tablename
            .create({
              ...req.body,
              user_id: req.context.userAccountId,
              instance_id: req.context.clientKey,
            })
            .then((result) => {
              res.send({ text: result.text });
            })
            .catch((err) => console.log(err));
        }
      });
  });

  // This is an example route used by "generalPages" module (see atlassian-connect.json).
  // Verify that the incoming request is authenticated with Atlassian Connect.
  app.get("/teamlead-hide", addon.authenticate(), (req, res) => {
    // Rendering a template is easy; the render method takes two params: the name of the component or template file, and its props.
    // Handlebars and jsx are both supported, but please note that jsx changes require `npm run watch-jsx` in order to be picked up by the server.
    res.render(
      "hello-world.js" // change this to 'hello-world.jsx' to use the Atlaskit & React version
    );
  });

  // Add additional route handlers here...
}
