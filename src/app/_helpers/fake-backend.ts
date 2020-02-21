import { Http, BaseRequestOptions, Response, ResponseOptions, RequestMethod, XHRBackend, RequestOptions } from '@angular/http';
import { MockBackend, MockConnection } from '@angular/http/testing';

export function fakeBackendFactory(backend: MockBackend, options: BaseRequestOptions, realBackend: XHRBackend) {
    let users: any[] = JSON.parse(localStorage.getItem('users')) || [];

    backend.connections.subscribe((connection: MockConnection) => {
        setTimeout(() => {

            // authenticate
            if (connection.request.url.endsWith('/api/authenticate') && connection.request.method === RequestMethod.Post) {
                let params = JSON.parse(connection.request.getBody());

                let filteredUsers = users.filter(user => {
                    return user.email === params.email && user.password === params.password;
                });

                if (filteredUsers.length) {
                    let user = filteredUsers[0];
                    connection.mockRespond(new Response(new ResponseOptions({
                        status: 200,
                        body: {
                            id: user.id,
                            email: user.email,
                            fullName: user.fullName,
                            token: 'fake-jwt-token'
                        }
                    })));
                } else {
                    connection.mockError(new Error('Email or password is incorrect'));
                }

                return;
            }

            // get users
            if (connection.request.url.endsWith('/api/users') && connection.request.method === RequestMethod.Get) {
                if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: users })));
                } else {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 401 })));
                }

                return;
            }

            // get user by id
            if (connection.request.url.match(/\/api\/users\/\d+$/) && connection.request.method === RequestMethod.Get) {
                if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                    let urlParts = connection.request.url.split('/');
                    let id = parseInt(urlParts[urlParts.length - 1]);
                    let matchedUsers = users.filter(user => { return user.id === id; });
                    let user = matchedUsers.length ? matchedUsers[0] : null;
                    connection.mockRespond(new Response(new ResponseOptions({ status: 200, body: user })));
                } else {
                    connection.mockRespond(new Response(new ResponseOptions({ status: 401 })));
                }

                return;
            }

            // create user
            if (connection.request.url.endsWith('/api/users') && connection.request.method === RequestMethod.Post) {
                let newUser = JSON.parse(connection.request.getBody());

                let duplicateUser = users.filter(user => { return user.email === newUser.email; }).length;
                if (duplicateUser) {
                    return connection.mockError(new Error('Email "' + newUser.email + '" is already taken'));
                }

                newUser.id = users.length + 1;
                users.push(newUser);
                localStorage.setItem('users', JSON.stringify(users));

                connection.mockRespond(new Response(new ResponseOptions({ status: 200 })));

                return;
            }

            // update user
            if (connection.request.url.match(/\/api\/users\/\d+$/) && connection.request.method === RequestMethod.Put) {
              let newUser = JSON.parse(connection.request.getBody());
              if (newUser.resetPassword) {
                for (let i = 0; i < users.length; i++) {
                    let user = users[i];
                    if (user.id === newUser.id) {
                      users.splice(i, 1);
                      users.push(newUser);
                      localStorage.setItem('users', JSON.stringify(users));
                      break;
                    }
                }
                connection.mockRespond(new Response(new ResponseOptions({ status: 200 })));
                return;

              } else {
                let duplicateUser = users.filter(user => { return user.email === newUser.email; }).length;
                if (duplicateUser) {
                    return connection.mockError(new Error('Email "' + newUser.email + '" is already taken'));
                }
              }

              if (connection.request.headers.get('Authorization') === 'Bearer fake-jwt-token') {
                for (let i = 0; i < users.length; i++) {
                    let user = users[i];
                    if (user.id === newUser.id) {
                      users.splice(i, 1);
                      users.push(newUser);
                      localStorage.setItem('users', JSON.stringify(users));
                      break;
                    }
                }
                connection.mockRespond(new Response(new ResponseOptions({ status: 200 })));
              } else {
                connection.mockRespond(new Response(new ResponseOptions({ status: 401 })));
              }
              return;
            }

            let realHttp = new Http(realBackend, options);
            let requestOptions = new RequestOptions({
                method: connection.request.method,
                headers: connection.request.headers,
                body: connection.request.getBody(),
                url: connection.request.url,
                withCredentials: connection.request.withCredentials,
                responseType: connection.request.responseType
            });
            realHttp.request(connection.request.url, requestOptions)
                .subscribe((response: Response) => {
                    connection.mockRespond(response);
                },
                (error: any) => {
                    connection.mockError(error);
                });

        }, 500);

    });

    return new Http(backend, options);
};

export let fakeBackendProvider = {
    provide: Http,
    useFactory: fakeBackendFactory,
    deps: [MockBackend, BaseRequestOptions, XHRBackend]
};
