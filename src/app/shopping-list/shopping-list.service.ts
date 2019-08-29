import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShoppingListDTO } from './shopping-list.dto';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ShoppingListService {
    private apiUrl = `${environment.baseUrl}/api/shoplist`;

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<ShoppingListDTO[]> {
        return this.http.get<ShoppingListDTO[]>(`${this.apiUrl}`);
    }

    getById(id: string): Observable<ShoppingListDTO> {
        return this.http.get<ShoppingListDTO>(`${this.apiUrl}/${id}`);
    }

    create(input: ShoppingListDTO): Observable<ShoppingListDTO> {
        console.log('create - input: ', input);
        return this.http.post<ShoppingListDTO>(`${this.apiUrl}`, input);
    }

    update(id: string, input: ShoppingListDTO): Observable<ShoppingListDTO> {
        return this.http.put<ShoppingListDTO>(`${this.apiUrl}/${id}`, input);
    }

    delete(id: string): Observable<ShoppingListDTO> {
        return this.http.delete<ShoppingListDTO>(`${this.apiUrl}/${id}`);
    }
}
