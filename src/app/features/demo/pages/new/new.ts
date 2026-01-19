import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DemoNewService } from '../../services/new.services';

@Component({
    selector: 'app-new',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './new.html'
})
export class New implements OnInit {
    private fb = inject(FormBuilder);
    protected newService = inject(DemoNewService);

    form: FormGroup = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        telefono: ['', [Validators.required, Validators.pattern(/^[0-9+ ]+$/)]],
        fecha_nacimiento: ['', [Validators.required]],
        edad: [null, [Validators.required, Validators.min(0), Validators.max(120)]]
    });

    ngOnInit(): void {
        this.newService.resetState();
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.newService.createNew(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }
}
