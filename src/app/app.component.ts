import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  previsualizacion: string = "";
  archivos: any = []
  data: any = []


  constructor(
    public fb: FormBuilder,
    public http: HttpClient,
    public sanitizer: DomSanitizer,
    ){}
    public baseUrl:string = environment.baseUrl;

    frm = this.fb.group({
      nombre:       ['', Validators.required],
      apellido:     ['', Validators.required],
      DNI:          ['', Validators.required],
      nacimiento:   ['', Validators.required],
      email:        ['', Validators.required],
      imagen:       ['', Validators.required]
    });

    ngOnInit() {
      this.http.get(`${this.baseUrl}/usario`)
        .subscribe( (resp: any) => {
          this.data.push(resp.contenido)
        })
    }

    enviar(){
      this.extraerBase64(this.archivos[0]).then((imagen: any) => {
        let datos = {
          nombre:       this.frm.controls['nombre'].value,
          apellido:     this.frm.controls['apellido'].value,
          DNI:          this.frm.controls['DNI'].value,
          nacimiento:   this.frm.controls['nacimiento'].value,
          email:        this.frm.controls['email'].value,
          imagen:       imagen.base
        };

        let formData: any = new FormData();
        formData.append("contenido", JSON.stringify(datos));

        const headers = new HttpHeaders();
        headers.append('Content-Type', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        this.http.post(`${this.baseUrl}/usuario`,formData, {headers: headers});
      })
    }


    capturarArchivo(e: any): void{
      const archivo = e.target.files[0];
      this.extraerBase64(archivo).then((imagen: any) => {
        this.previsualizacion = imagen.base;
      })
      this.archivos.push(archivo)
    }


    extraerBase64 = async ($event: any) => new Promise((resolve, reject): any => {
      try {
        const unsafeImg = window.URL.createObjectURL($event);
        const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
        const reader = new FileReader();
        reader.readAsDataURL($event);
        reader.onload = () => {
          resolve({
            base: reader.result
          });
        };
        reader.onerror = error => {
          resolve({
            base: null
          });
        };

      } catch (e) {
        return null;
      }
    })


}
