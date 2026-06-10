  import { HttpClient } from '@angular/common/http';
  import { Injectable } from '@angular/core';

  @Injectable({ providedIn: 'root' })
  export class NoticeService {

            private baseUrl = 'http://localhost:5115/api/notice';

          // private baseUrl = 'http://10.132.241.11/backend/api/notice';

          // private baseUrl = 'http://164.100.150.78/excise/backend/api/notice';

          // private baseUrl = 'https://excise.cg.nic.in/backend/api/notice';

          //private baseUrl = 'https://103.195.218.50/excise/ExciseNotice/Backend/api/notice';


    constructor(private http: HttpClient) {}

   getAll() {
  const token = localStorage.getItem('token');

  return this.http.get<any[]>(this.baseUrl, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
getYears() {
  return this.http.get<number[]>(`${this.baseUrl}/years`);
}

getByYear(year: number) {
  return this.http.get<any[]>(`${this.baseUrl}/year/${year}`);
}

    add(formData: FormData) {
      return this.http.post<any>(`${this.baseUrl}/add`, formData);
    }

    update(id: number, formData: FormData) {
      return this.http.put<any>(`${this.baseUrl}/update/${id}`, formData);
    }

  // delete(id: number) {
  //   return this.http.delete(`http://localhost:5115/api/notice/delete/${id}`, {
  //     responseType: 'text' as 'json' 
  //   });
  // }
  delete(id: number) {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {
      responseType: 'text' as 'json'
    });
  }
    getXml() {
  return this.http.get(
    `${this.baseUrl}/xml?time=` + new Date().getTime(), // 🔥 cache fix
    {
      responseType: 'text'
    }
  );
}
 addNotice(data: FormData) {
  return this.http.post(`${this.baseUrl}/add`, data);
}
  }